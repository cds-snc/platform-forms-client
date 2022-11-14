import React, { useState } from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { DesignIcon, ExternalLinkIcon, WarningIcon } from "../icons";
import { validateTemplate } from "../validate";
import { sortByLayout } from "../util";

import { errorMessage } from "../validate";

export const Start = ({ changeTab }: { changeTab: (tab: string) => void }) => {
  const { t } = useTranslation("form-builder");

  const importTemplate = useTemplateStore((s) => s.importTemplate);
  const [errors, setErrors] = useState<errorMessage[]>();

  // Prevent prototype pollution in JSON.parse https://stackoverflow.com/a/63927372
  const cleaner = (key: string, value: string) =>
    ["__proto__", "constructor"].includes(key) ? undefined : value;

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

        // ensure elements follow layout array order
        data.form.elements = sortByLayout(data.form);
        importTemplate(data);
        changeTab("preview");
      };
    } catch (e) {
      if (e instanceof Error) {
        setErrors([{ message: e.message }]);
      }
    }
  };

  const boxClass =
    "group w-80 h-80 mx-4 pt-28 pl-6 pr-5 bg-gray-background border-3 border-black-default rounded-xl flex flex-col focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 hover:cursor-pointer focus:cursor-pointer hover:bg-gray-selected";

  return (
    <>
      {errors && (
        <div className="bg-red-100 w-5/12 m-auto mb-8 p-6 flex" role="alert">
          <WarningIcon />
          <div>
            <h3 className="ml-6 mb-2 mt-1">{t("failedToReadFormFile")}</h3>
            <ul className="list-none pl-6 mb-4">
              {errors.map((error, index) => {
                return <li key={`section-${index}`}>{error.message}</li>;
              })}
            </ul>
            <a href="https://example.com" className="ml-6">
              {t("contactSupport")}
            </a>
          </div>
        </div>
      )}
      <div className="flex justify-center">
        <button
          className={boxClass}
          onClick={(e) => {
            e.preventDefault();
            changeTab("create");
          }}
        >
          <DesignIcon className="mb-2 scale-125" />
          <h2 className="p-0 mb-1 group-hover:underline group-focus:underline">{t("startH2")}</h2>
          <p className="text-sm">{t("startP1")}</p>
        </button>
        <label
          className={boxClass}
          htmlFor="file-upload"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const uploadButton = document.getElementById("file-upload");
              if (uploadButton) uploadButton.click();
            }
          }}
          tabIndex={0}
        >
          <ExternalLinkIcon className="mb-2" />
          <h2 className="p-0 mb-1 group-hover:underline group-focus:underline">{t("startH3")}</h2>
          <p className="text-sm">{t("startP2")}</p>
        </label>
        <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
      </div>
    </>
  );
};
