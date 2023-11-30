import React from "react";
import { customTranslate } from "../../helpers";

export const CopyCodes = ({
  confirmationCodes,
  lang,
}: {
  confirmationCodes: string;
  lang: string;
}) => {
  const { t } = customTranslate("my-forms");
  const capitalizedLang = lang === "en" ? "En" : "Fr";

  return (
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
      <span
        id={`copyCodeOutput${capitalizedLang}`}
        aria-live="polite"
        className="ml-8 hidden text-green"
      ></span>
    </div>
  );
};
