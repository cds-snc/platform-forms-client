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

  const resumeError = t("errorPanel.defaultTitle", { lng: language, ns: "common" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      return;
    }

    const target = e.target;

    try {
      const fileReader = new FileReader();

      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (!e.target || !e.target.result || typeof e.target.result !== "string") {
          throw new Error("Resume: Target result is not a string");
        }

        const data = e.target.result;

        if (!data) {
          target.value = "";
          throw new Error("Resume: No data found in file");
        }

        const parser = new DOMParser();
        const htmlDoc = parser.parseFromString(data, "text/html");

        if (!htmlDoc.getElementById("form-data")) {
          throw new Error("Resume: Failed to parse HTML");
        }

        const jsonData = htmlDoc.getElementById("form-data")?.textContent;

        if (!jsonData) {
          throw new Error("Resume: Failed to find form-data");
        }

        const parsedHTMLData = JSON.parse(jsonData);
        const parsedJsonData = parsedHTMLData.data;
        const formData = Buffer.from(parsedJsonData, "base64").toString("utf8");
        const parsed = JSON.parse(formData);
        const id = parsed.id;

        if (!id || id !== formId) {
          throw new Error("Resume: Invalid form ID");
        }

        saveSessionProgress(language, {
          id: id,
          values: parsed.values,
          history: parsed.history,
          currentGroup: parsed.currentGroup,
        });

        router.push(`/${language}/id/${id}`);
      };
    } catch (e) {
      toast.error(resumeError, "resume");
    }
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
