import React from "react";
import { customTranslate } from "../../../i18nHelpers";

export const CopyCodes = ({
  confirmationCodes,
  formId,
  lang,
}: {
  confirmationCodes: string;
  formId: string;
  lang: string;
}) => {
  const { t } = customTranslate("my-forms");
  const capitalizedLang = lang === "en" ? "En" : "Fr";
  const HOST = process.env.NEXTAUTH_URL || "";

  return (
    <div className="flex flex-row">
      <div>
        <button
          id={`copyCodeButton${capitalizedLang}`}
          className="gc-button--blue"
          type="button"
          aria-labelledby={`confirmReceiptInfo${capitalizedLang}`}
          data-clipboard-text={confirmationCodes}
        >
          {t("responseAggregatedTemplate.copyCodes.copyButton", { lng: lang })}
        </button>
        <br />
        <div
          id={`copyCodeOutput${capitalizedLang}`}
          aria-live="polite"
          className="ml-6 mt-4 hidden text-green"
        ></div>
      </div>
      <div>
        <a
          href={`${HOST}/form-builder/responses/${formId}/downloaded`}
          className="ml-4 block h-16 rounded-lg border border-black bg-white px-6 py-4 text-black shadow hover:bg-gray-400"
        >
          {t("responseAggregatedTemplate.goToGcForms", { lng: lang })}
        </a>
      </div>
    </div>
  );
};
