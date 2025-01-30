"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";
import { ExternalLinkIcon } from "@serverComponents/icons";
import { saveProgress } from "@lib/utils/saveProgress";

export const Upload = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      return;
    }

    const target = e.target;

    try {
      const fileReader = new FileReader();

      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (!e.target || !e.target.result || typeof e.target.result !== "string") return;
        const data = e.target.result;
        if (!data) {
          target.value = "";
          return;
        }

        const formData = Buffer.from(data, "base64").toString("utf8");
        const parsed = JSON.parse(formData);
        const id = parsed.id;

        saveProgress(language, {
          id: id,
          values: parsed.values,
          history: parsed.history,
          currentGroup: parsed.currentGroup,
        });

        router.push(`/${language}/id/${id}`);
      };
    } catch (e) {
      if (e instanceof Error) {
        // no-op
      }
    }
  };

  const boxClass =
    "group mx-4 mb-4 flex h-80 w-80 flex-col rounded-xl border-[0.5px] border-slate-500 bg-gray-background pl-6 pr-5 pt-28 text-left outline-none hover:cursor-pointer hover:border-[1px] hover:border-indigo-700 hover:bg-indigo-50 focus:cursor-pointer focus:border-[3px] focus:border-slate-700";

  return (
    <>
      <h1 className="visually-hidden">{t("start")}</h1>
      <div className="flex flex-col justify-center tablet:flex-row">
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
            <h2 className="mb-1 p-0 group-hover:underline group-focus:underline">{t("startH3")}</h2>
            <p className="text-sm">{t("startP2")}</p>
            <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
          </div>
        </label>
      </div>
    </>
  );
};
