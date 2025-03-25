"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { InternalLinkIcon } from "@serverComponents/icons";
import { saveSessionProgress } from "@lib/utils/saveSessionProgress";
import { useFeatureFlags } from "@lib/hooks/useFeatureFlags";
import { FeatureFlags } from "@lib/cache/types";
import { ErrorPanel } from "@clientComponents/globals/ErrorPanel";
import { toast } from "@formBuilder/components/shared/Toast";
import { ToastContainer } from "@formBuilder/components/shared/Toast";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { safeJSONParse } from "@lib/utils";
import { type FormValues } from "@lib/formContext";

import { ErrorResuming } from "./ErrorResuming";
import { ResumeUploadIcon } from "@serverComponents/icons/ResumeUploadIcon";
import { LightBulbIcon } from "@serverComponents/icons/LightBulbIcon";
import { GcdsH1 } from "@serverComponents/globals/GcdsH1";
import { useLogClientMessage } from "@lib/hooks/LogClientMessage/useLogClientMessage";

// Prevent prototype pollution in JSON.parse https://stackoverflow.com/a/63927372
const cleaner = (key: string, value: string) =>
  ["__proto__", "constructor"].includes(key) ? undefined : value;

type ResumeFormResponse = {
  id: string;
  values: FormValues;
  history: string[];
  currentGroup: string;
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
  const { logClientError } = useLogClientMessage();

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
        logClientError({ code: errorCode as FormServerErrorCodes, formId, timestamp: Date.now() });
        toast.error(<ErrorResuming errorCode={errorCode} />, "resume");
      }
    };
  };

  const title = language === "en" ? titleEn : titleFr;

  if (!saveAndResumeEnabled) {
    return <ErrorPanel supportLink={false} />;
  }

  return (
    <>
      <div className="mb-4 flex flex-col items-center justify-center">
        <GcdsH1>{title}</GcdsH1>
        {/* Upload and resume */}
        <label>
          <div
            tabIndex={0}
            role="button"
            className="group mb-8 flex h-auto w-full flex-col items-center justify-center rounded-3xl border-3 border-dashed border-indigo-500 bg-violet-50 text-left outline-none hover:cursor-pointer hover:border-indigo-700 hover:bg-violet-200 focus:cursor-pointer focus:border-gcds-blue-850 focus:bg-gcds-blue-850 focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-gcds-blue-850 active:outline-[3px] active:outline-offset-2 active:outline-gcds-blue-850 tablet:mx-4 tablet:size-[22rem]"
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

        {/* Instructions*/}
        <div className="mb-6 flex border-b-1 border-slate-500 pb-8">
          <LightBulbIcon className="mr-4" />
          <div>
            <div className="mb-2 p-0 !text-xl">
              {t("saveAndResume.resumePage.readyToContinue.title")}
            </div>
            <p className="text-sm">{t("saveAndResume.resumePage.readyToContinue.intro")}</p>
            <p className="text-sm">{t("saveAndResume.resumePage.readyToContinue.text1")}</p>
            <p className="text-sm">{t("saveAndResume.resumePage.readyToContinue.text2")}</p>
            <p className="text-sm">{t("saveAndResume.resumePage.readyToContinue.text3")}</p>
          </div>
        </div>

        {/* Start again */}
        <button
          className="group flex items-center rounded-full border-1 border-slate-500 bg-gray-background p-2 px-6 hover:cursor-pointer hover:border-indigo-700 hover:bg-violet-50 focus:cursor-pointer focus:border-gcds-blue-850 focus:bg-gcds-blue-850 focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-gcds-blue-850 tablet:px-14"
          onClick={async (e) => {
            e.preventDefault();
            router.push(`/${language}/id/${formId}`);
          }}
        >
          <InternalLinkIcon className="mr-4 inline-block scale-125 group-focus:fill-white" />
          <div className="!mb-0 inline-block p-0 !text-2xl tablet:!text-3xl">
            {t("saveAndResume.resumePage.restart.title")}
          </div>
        </button>
      </div>
      <ToastContainer limit={1} autoClose={false} containerId="resume" />
    </>
  );
};
