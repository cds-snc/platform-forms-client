import React, { useState } from "react";
import { useTemplateStore, clearTemplateStore } from "../store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { DesignIcon, ExternalLinkIcon, WarningIcon } from "../icons";
import { useRouter } from "next/router";
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
        router.push({ pathname: `/${language}/form-builder/preview` });
      };
    } catch (e) {
      if (e instanceof Error) {
        setErrors([{ message: e.message }]);
      }
    }
  };

  const boxClass =
    "group w-80 h-80 mx-4 mb-4 pt-28 pl-6 pr-5 bg-gray-background border-3 border-black-default text-left rounded-xl flex flex-col focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 hover:cursor-pointer focus:cursor-pointer hover:bg-gray-selected";

  /* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
  /* eslint-disable jsx-a11y/no-noninteractive-tabindex */
  return (
    <>
      <h1 className="visually-hidden">{t("start")}</h1>
      <div role="alert">
        {errors && (
          <div className="bg-red-100 w-5/12 m-auto mb-8 p-6 flex">
            <WarningIcon />
            <div>
              <h3 className="ml-6 mb-2 mt-1">{t("failedToReadFormFile")}</h3>
              <ul className="list-none pl-6 mb-4">
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
      <div className="flex flex-col tablet:flex-row justify-center">
        <button
          className={boxClass}
          onClick={async (e) => {
            e.preventDefault();
            // clear any existing form data
            clearTemplateStore();
            initialize();
            router.push({ pathname: `/${language}/form-builder/edit` });
          }}
        >
          <DesignIcon className="mb-2 scale-125" />
          <h2 className="p-0 mb-1 group-hover:underline group-focus:underline">{t("startH2")}</h2>
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
            <h2 className="p-0 mb-1 group-hover:underline group-focus:underline">{t("startH3")}</h2>
            <p className="text-sm">{t("startP2")}</p>
            <input id="file-upload" type="file" onChange={handleChange} className="hidden" />
          </label>
        </div>
      </div>
    </>
  );
};
