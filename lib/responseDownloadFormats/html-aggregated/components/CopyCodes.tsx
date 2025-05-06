import React from "react";
import { customTranslate } from "../../../i18nHelpers";

export const CopyCodes = ({
  confirmationCodes,
  formId,
  lang,
  host,
}: {
  confirmationCodes: string;
  formId: string;
  lang: string;
  host: string;
}) => {
  const { t } = customTranslate("my-forms");
  const capitalizedLang = lang === "en" ? "En" : "Fr";

  return (
    <div>
      <div className="flex flex-row gap-4">
        <button
          className="inline-flex items-center rounded-md border-2 border-solid border-gcds-blue-800 bg-gcds-blue-900 p-3 font-medium leading-[24px] text-white-default transition-all duration-150 ease-in-out hover:border-gcds-blue-800 hover:bg-gcds-blue-800 hover:text-white-default focus:border-gcds-blue-850 focus:bg-gcds-blue-850 focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-gcds-blue-850 active:top-0.5 active:border-black active:bg-black active:text-white-default active:outline-[3px] active:outline-offset-2 active:outline-gcds-blue-850 disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light disabled:text-gray-dark"
          id={`copyCodeButton${capitalizedLang}`}
          aria-labelledby={`confirmReceiptInfo${capitalizedLang}`}
          data-clipboard-text={confirmationCodes}
        >
          {t("responseAggregatedTemplate.copyCodes.copyButton", { lng: lang })}
        </button>
        <br />

        <a
          href={`${host}/form-builder/${formId}/responses/downloaded`}
          className="ml-4 block rounded-lg border border-black bg-white px-6 py-4 text-black shadow hover:bg-gray-400"
        >
          {t("responseAggregatedTemplate.goToGcForms", { lng: lang })}
        </a>
      </div>
      <div
        id={`copyCodeOutput${capitalizedLang}`}
        aria-live="polite"
        className="mt-4 hidden text-green"
      ></div>
    </div>
  );
};
