"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { InternalLinkIcon } from "@serverComponents/icons";
import { ExternalLinkIcon } from "@serverComponents/icons";
import { saveSessionProgress } from "@lib/utils/saveSessionProgress";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { toast } from "@formBuilder/components/shared/Toast";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { safeJSONParse } from "@lib/utils";
import { type FormValues } from "@lib/formContext";
import { WarningIcon } from "@serverComponents/icons";

// Prevent prototype pollution in JSON.parse https://stackoverflow.com/a/63927372
const cleaner = (key: string, value: string) =>
  ["__proto__", "constructor"].includes(key) ? undefined : value;

type ResumeFormResponse = {
  id: string;
  values: FormValues;
  history: string[];
  currentGroup: string;
};

export const ErrorResuming = ({ errorCode }: { errorCode?: string }) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const title = t("saveAndResume.resumeUploadError.title", {
    lng: language,
    ns: "common",
  });

  const message = t("saveAndResume.resumeUploadError.description", {
    lng: language,
    ns: "common",
  });

  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-2 text-xl font-semibold">
        <WarningIcon className="mr-1 mt-[-4] inline-block size-8 fill-red-800" /> {title}
      </h3>
      <p className="mb-2 text-black">{message} </p>
      <p className="mb-5 text-sm text-black">
        {errorCode && t("saveAndResume.resumeUploadError.errorCode", { code: errorCode })}
      </p>
    </div>
  );
};

export const ResumeForm = ({
  formId,
  titleEn,
  titleFr,
}: {
  formId: string;
  titleEn: string;
  titleFr: string;
}) => {
  const {
    t,
    i18n: { language },
  } = useTranslation(["form-builder", "common"]);

  const router = useRouter();

  const { getFlag } = useFeatureFlags();
  const saveAndResumeEnabled = getFlag(FeatureFlags.saveAndResume);

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
        toast.error(<ErrorResuming errorCode={errorCode} />, "resume");
      }
    };
  };

  const boxClass =
    "group mx-4 mb-4 flex h-80 w-80 flex-col rounded-xl border-[0.5px] border-slate-500 bg-gray-background pl-6 pr-5 pt-28 text-left outline-none hover:cursor-pointer hover:border-[1px] hover:border-indigo-700 hover:bg-indigo-50 focus:cursor-pointer focus:border-[3px] focus:border-slate-700";

  const title = language === "en" ? titleEn : titleFr;

  if (!saveAndResumeEnabled) {
    return <ErrorPanel supportLink={false} />;
  }

  return (
    <>
      <h1 className="sr-only">{title}</h1>
      <div className="flex flex-col justify-center tablet:flex-row">
        {/* Start again */}
        <button
          className={boxClass}
          onClick={async (e) => {
            e.preventDefault();
            router.push(`/${language}/id/${formId}`);
          }}
        >
          <InternalLinkIcon className="mb-2 scale-125" />
          <h2 className="mb-1 p-0 group-hover:underline group-focus:underline">
            {t("saveAndResume.resumePage.restart.title")}
          </h2>
          <p className="text-sm">{t("saveAndResume.resumePage.restart.description")}</p>
        </button>

        {/* Upload and resume */}
        <label>
          <div
            tabIndex={0}
            role="button"
            className={boxClass}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                const uploadButton = document.getElementById("file-upload");
                if (uploadButton) uploadButton.click();
              }
            }}
          >
            <ExternalLinkIcon className="mb-2 scale-125" />
            <h2 className="mb-1 p-0 group-hover:underline group-focus:underline">
              {t("saveAndResume.resumePage.upload.title")}
            </h2>
            <p className="text-sm">{t("saveAndResume.resumePage.upload.description")}</p>
            <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
          </div>
        </label>
      </div>
      <ToastContainer limit={1} autoClose={false} containerId="resume" />
    </>
  );
};
