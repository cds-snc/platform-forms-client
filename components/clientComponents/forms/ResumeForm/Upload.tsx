import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

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

export const Upload = ({ formId }: { formId: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const router = useRouter();
  const { logClientError } = useLogClient();

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

        if (id !== formId) {
          errorCode = FormServerErrorCodes.FORM_RESUME_INVALID_MISMATCHED_FORM_ID;
          throw new Error(errorCode);
        }

        if (!parsed.values || !parsed.history || !parsed.currentGroup) {
          errorCode = FormServerErrorCodes.FORM_RESUME_INVALID_DATA;
          throw new Error(errorCode);
        }

        saveSessionProgress(language, {
          id: id,
          values: parsed.values,
          history: parsed.history,
          currentGroup: parsed.currentGroup,
        });
        router.push(`/${language}/id/${id}`);
      } catch (e) {
        const timestamp = Date.now();

        if (
          errorCode === FormServerErrorCodes.FORM_RESUME_INVALID_MISMATCHED_FORM_ID ||
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
    <div className="min-w-96">
      <label>
        <div
          tabIndex={0}
          role="button"
          className="group mb-8 flex h-auto w-full flex-col items-center justify-center rounded-3xl border-3 border-dashed border-indigo-500 bg-violet-50 text-left outline-none hover:cursor-pointer hover:border-indigo-700 hover:bg-violet-200 focus:cursor-pointer focus:border-gcds-blue-850 focus:bg-gcds-blue-850 focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-gcds-blue-850 active:outline-[3px] active:outline-offset-2 active:outline-gcds-blue-850"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              const uploadButton = document.getElementById("file-upload");
              if (uploadButton) uploadButton.click();
            }
          }}
        >
          <div className="m-10">
            <div className="flex items-center tablet:block">
              <ResumeUploadIcon className="group-focus:fill-white" />
              <h2 className="!mb-1 p-0 !text-2xl tablet:!text-3xl">
                {t("saveAndResume.resumePage.upload.title")}
              </h2>
            </div>
            <p className="text-sm">{t("saveAndResume.resumePage.upload.description")}</p>
            <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
          </div>
        </div>
      </label>
    </div>
  );
};
