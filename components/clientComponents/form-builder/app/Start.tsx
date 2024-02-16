"use client";
import React, { useState } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

import { useTemplateStore, clearTemplateStore } from "../store/useTemplateStore";
import { DesignIcon, ExternalLinkIcon, WarningIcon } from "@serverComponents/icons";
import { errorMessage, validateTemplate } from "../validate";
import Link from "next/link";

export const Start = () => {
  const {
    t,
    i18n: { language },
  } = useTranslation("form-builder");
  const router = useRouter();
  const { importTemplate, initialize } = useTemplateStore((s) => ({
    importTemplate: s.importTemplate,
    initialize: s.initialize,
  }));

  const [errors, setErrors] = useState<errorMessage[]>();

  // Prevent prototype pollution in JSON.parse https://stackoverflow.com/a/63927372
  const cleaner = (key: string, value: string) =>
    ["__proto__", "constructor"].includes(key) ? undefined : value;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target || !e.target.files) {
      return;
    }

    const target = e.target;
    // clear any existing form data
    clearTemplateStore();

    try {
      const fileReader = new FileReader();

      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (!e.target || !e.target.result || typeof e.target.result !== "string") return;
        let data;

        try {
          data = JSON.parse(e.target.result, cleaner);
        } catch (e) {
          if (e instanceof SyntaxError) {
            setErrors([{ message: t("startErrorParse") }]);
            target.value = "";
            return;
          }
        }

        const validationResult = validateTemplate(data);

        if (!validationResult.valid) {
          setErrors(validationResult.errors);
          target.value = "";
          return;
        }

        importTemplate(data);

        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "open_form_file",
        });
        router.push(`/${language}/form-builder/preview`);
      };
    } catch (e) {
      if (e instanceof Error) {
        setErrors([{ message: e.message }]);
      }
    }
  };

  const boxClass =
    "group mx-4 mb-4 flex h-80 w-80 flex-col rounded-xl border-[0.5px] border-slate-500 bg-gray-background pl-6 pr-5 pt-28 text-left outline-none hover:cursor-pointer hover:border-[1px] hover:border-indigo-700 hover:bg-indigo-50 focus:cursor-pointer focus:border-[3px] focus:border-slate-700";

  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
  return (
    <>
      <h1 className="visually-hidden">{t("start")}</h1>
      <div role="alert">
        {errors && (
          <div className="m-auto mb-8 flex w-5/12 bg-red-100 p-6">
            <WarningIcon />
            <div>
              <h3 className="mb-2 ml-6 mt-1">{t("failedToReadFormFile")}</h3>
              <ul className="mb-4 list-none pl-6">
                {errors.map((error, index) => {
                  return (
                    <li key={`section-${index}`}>
                      {t(error.message, { property: error.property })}
                    </li>
                  );
                })}
              </ul>
              <Link href={`/${language}/form-builder/support`} className="ml-6">
                {t("contactSupport")}
              </Link>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-col justify-center tablet:flex-row">
        <button
          className={boxClass}
          onClick={async (e) => {
            e.preventDefault();
            // clear any existing form data
            clearTemplateStore();
            initialize(language);
            router.push(`/${language}/form-builder/0000/edit`);
          }}
        >
          <DesignIcon className="mb-2 scale-125" />
          <h2 className="mb-1 p-0 group-hover:underline group-focus:underline">{t("startH2")}</h2>
          <p className="text-sm">{t("startP1")}</p>
        </button>
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
          <label>
            <ExternalLinkIcon className="mb-2 scale-125" />
            <h2 className="mb-1 p-0 group-hover:underline group-focus:underline">{t("startH3")}</h2>
            <p className="text-sm">{t("startP2")}</p>
            <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
          </label>
        </div>
      </div>
    </>
  );
};
