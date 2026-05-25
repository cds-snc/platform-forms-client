import { useState } from "react";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";

import { saveSessionProgress } from "@lib/utils/saveSessionProgress";

import { type FormValues } from "@gcforms/types";
import { toast } from "@formBuilder/components/shared/Toast";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { safeJSONParse } from "@lib/utils";
import { ErrorResuming } from "./ErrorResuming";
import { ErrorLoading } from "./ErrorLoading";
import { useLogClient } from "@lib/hooks/LogClient/useLogClient";
import { ResumeUploadIcon } from "@serverComponents/icons/ResumeUploadIcon";

// Prevent prototype pollution in JSON.parse https://stackoverflow.com/a/63927372
const cleaner = (key: string, value: string) =>
  ["__proto__", "constructor"].includes(key) ? undefined : value;

type ResumeFormResponse = {
  id: string;
  values: FormValues;
  history: string[];
  currentGroup: string;
};

type PendingMismatchResume = Omit<ResumeFormResponse, "id"> & {
  sourceFormId: string;
};

export const Upload = ({ formId }: { formId: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const router = useRouter();
  const { logClientError } = useLogClient();
  const dialogRef = useDialogRef();
  const [pendingMismatchResume, setPendingMismatchResume] = useState<PendingMismatchResume | null>(
    null
  );

  const restoreProgress = ({
    id,
    values,
    history,
    currentGroup,
    sourceFormId,
  }: ResumeFormResponse & { sourceFormId?: string }) => {
    saveSessionProgress(language, {
      id,
      values,
      history,
      currentGroup,
      sourceFormId,
    });
    router.push(`/${language}/id/${id}`);
  };

  const handleContinueAnyway = () => {
    if (!pendingMismatchResume) {
      return;
    }

    dialogRef.current?.close();
    restoreProgress({
      id: formId,
      values: pendingMismatchResume.values,
      history: pendingMismatchResume.history,
      currentGroup: pendingMismatchResume.currentGroup,
      sourceFormId: pendingMismatchResume.sourceFormId,
    });
    setPendingMismatchResume(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      return;
    }

    const target = e.target;

    let errorCode: string = FormServerErrorCodes.FORM_RESUME_DEFAULT;

    const fileReader = new FileReader();

    fileReader.readAsText(e.target.files[0], "UTF-8");

    fileReader.onerror = () => {
      toast.error(<ErrorResuming errorCode={FormServerErrorCodes.FORM_RESUME_DEFAULT} />, "resume");
      target.value = "";
    };

    fileReader.onload = (e) => {
      try {
        if (!e.target || !e.target.result || typeof e.target.result !== "string") {
          errorCode = FormServerErrorCodes.FORM_RESUME_NO_TARGET;
          throw new Error(errorCode);
        }

        const data = e.target.result;

        if (!data) {
          target.value = "";
          errorCode = FormServerErrorCodes.FORM_RESUME_NO_DATA;
          throw new Error(errorCode);
        }

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, "text/html");

        if (!htmlDoc.getElementById("form-data")) {
          errorCode = FormServerErrorCodes.FORM_RESUME_NO_ELEMENT;
          throw new Error(errorCode);
        }

        const jsonData = htmlDoc.getElementById("form-data")?.textContent;

        if (!jsonData) {
          errorCode = FormServerErrorCodes.FORM_RESUME_NO_FORM_ELEMENT_DATA;
          throw new Error(errorCode);
        }

        const parsedHTMLData = JSON.parse(jsonData);
        const parsedJsonData = parsedHTMLData.data;

        if (typeof parsedJsonData !== "string") {
          errorCode = FormServerErrorCodes.FORM_RESUME_INVALID_BASE64_STRING;
          throw new Error(errorCode);
        }

        const formData = Buffer.from(parsedJsonData, "base64").toString("utf8");
        const parsed = safeJSONParse<ResumeFormResponse>(formData, cleaner);

        if (!parsed) {
          errorCode = FormServerErrorCodes.FORM_RESUME_INVALID_JSON;
          throw new Error(errorCode);
        }

        const id = parsed.id;

        if (!id) {
          errorCode = FormServerErrorCodes.FORM_RESUME_INVALID_FORM_ID;
          throw new Error(errorCode);
        }

        if (!parsed.values || !parsed.history || !parsed.currentGroup) {
          errorCode = FormServerErrorCodes.FORM_RESUME_INVALID_DATA;
          throw new Error(errorCode);
        }

        if (id !== formId) {
          target.value = "";
          setPendingMismatchResume({
            sourceFormId: id,
            values: parsed.values,
            history: parsed.history,
            currentGroup: parsed.currentGroup,
          });
          return;
        }

        restoreProgress(parsed);
      } catch (e) {
        const timestamp = Date.now();

        if (
          errorCode === FormServerErrorCodes.FORM_RESUME_NO_TARGET ||
          errorCode === FormServerErrorCodes.FORM_RESUME_NO_DATA ||
          errorCode === FormServerErrorCodes.FORM_RESUME_NO_ELEMENT ||
          errorCode === FormServerErrorCodes.FORM_RESUME_NO_FORM_ELEMENT_DATA
        ) {
          // Do not log these errors as they are expected in some cases
          // (e.g. user uploads a file with a different form ID or wrong file).
          toast.error(<ErrorLoading errorCode={`${errorCode}-${timestamp}`} />, "resume");
          return;
        }

        logClientError({ code: errorCode as FormServerErrorCodes, formId, timestamp });
        toast.error(<ErrorResuming errorCode={`${errorCode}-${timestamp}`} />, "resume");
      }
    };
  };

  return (
    <>
      <div className="min-w-96">
        <label>
          <div
            tabIndex={0}
            role="button"
            className="group focus:border-gcds-blue-vivid focus:bg-gcds-blue-vivid focus:text-white-default focus:outline-gcds-blue-vivid active:outline-gcds-blue-vivid mb-8 flex h-auto w-full flex-col items-center justify-center rounded-3xl border-3 border-dashed border-indigo-500 bg-violet-50 text-left outline-none hover:cursor-pointer hover:border-indigo-700 hover:bg-violet-200 focus:cursor-pointer focus:outline-[3px] focus:outline-offset-2 active:outline-[3px] active:outline-offset-2"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                const uploadButton = document.getElementById("file-upload");
                if (uploadButton) uploadButton.click();
              }
            }}
          >
            <div className="m-10">
              <div className="tablet:block flex items-center">
                <ResumeUploadIcon className="group-focus:fill-white" />
                <h2 className="tablet:text-3xl! mt-0! mb-1! p-0 text-2xl!">
                  {t("saveAndResume.resumePage.upload.title")}
                </h2>
              </div>
              <p className="text-sm">{t("saveAndResume.resumePage.upload.description")}</p>
              <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
            </div>
          </div>
        </label>
      </div>

      {pendingMismatchResume && (
        <Dialog
          dialogRef={dialogRef}
          handleClose={() => setPendingMismatchResume(null)}
          title={t("saveAndResume.resumePage.mismatchedForm.title")}
          actions={
            <div className="flex gap-4">
              <Button
                theme="secondary"
                onClick={() => {
                  dialogRef.current?.close();
                  setPendingMismatchResume(null);
                }}
              >
                {t("saveAndResume.resumePage.mismatchedForm.cancel")}
              </Button>
              <Button onClick={handleContinueAnyway}>
                {t("saveAndResume.resumePage.mismatchedForm.continue")}
              </Button>
            </div>
          }
        >
          <div className="p-5">
            <p className="text-base">{t("saveAndResume.resumePage.mismatchedForm.description")}</p>
            <p className="mt-4 text-sm">{t("saveAndResume.resumePage.mismatchedForm.warning")}</p>
            <p className="mt-4 text-sm">
              <Link
                href={`/${language}/id/${pendingMismatchResume.sourceFormId}/resume`}
                className="text-blue-700 underline hover:text-blue-800"
              >
                {t("saveAndResume.resumePage.mismatchedForm.matchingFormLink")}
              </Link>
            </p>
          </div>
        </Dialog>
      )}
    </>
  );
};
