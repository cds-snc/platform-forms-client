import React from "react";
import { Form, Submission } from "../../types";
import { ColumnTable } from "./ColumnTable";
import { RowTable } from "./RowTable";
import { customTranslate, getProperty } from "@lib/i18nHelpers";

export interface ResponseSectionProps {
  confirmReceiptCode: string;
  lang: string;
  responseID: string;
  submissionDate: number;
  formResponse: Submission;
  form: Form;
}

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export const ResponseSection = ({
  confirmReceiptCode,
  lang,
  responseID,
  submissionDate,
  formResponse,
  form,
}: ResponseSectionProps) => {
  const { t } = customTranslate("my-forms");

  const capitalizedLang = capitalize(lang);

  const CopyToClipboardScripts = React.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `
          document.addEventListener("DOMContentLoaded", function() {
            // Copy Code
            var btnCopyCode = document.getElementById("copyCodeButton${capitalizedLang}");
            var outputCopyCode = document.getElementById("copyCodeOutput${capitalizedLang}");
            var clipboardCode = new ClipboardJS("#copyCodeButton${capitalizedLang}");
            clipboardCode.on('success', function (e) {
              outputCopyCode.classList.remove("hidden");
              outputCopyCode.textContent = "${t("responseTemplate.copiedToCipboard", {
                lng: lang || "en",
              })}";
              e.clearSelection();
            });
            clipboardCode.on('error', function () {
              outputCopyCode.classList.remove("hidden");
              outputCopyCode.classList.add("text-red-default");
              outputCopyCode.textContent = "${t("responseTemplate.errorrCopyingToClipboard", {
                lng: lang || "en",
              })}";
            });

            // Copy Row Response
            var btnCopyResponse = document.getElementById("copyResponseButton${capitalizedLang}");
            var outputCopyResponse = document.getElementById("copyResponseOutput${capitalizedLang}");
            var responseItems = Array.from(document.querySelectorAll("#responseTableRow${capitalizedLang} dd"));
            // Format with tab separators for Excel copy+paste
            var responseText = responseItems.map(item => {
              var text = item.textContent;
              // This is needed for Excell that relies on tabs or multiple spaces to delimit a new cell
              // and should replace any user content that may accidentally start a new cell.
              // Replace 1 or more tabs or newlines with nothing, and two or more spaces with nothing.
              return text.replace(/[\\t|\\n]{1,}|[ ]{2,}/g, "");
            }).join(String.fromCharCode(9));
            btnCopyResponse.dataset.clipboardText = responseText;
            var clipboardResponse = new ClipboardJS("#copyResponseButton${capitalizedLang}");
            clipboardResponse.on('success', function (e) {
              outputCopyResponse.classList.remove("hidden");
              outputCopyResponse.textContent = "${t("responseTemplate.copiedToCipboard", {
                lng: lang || "en",
              })}";
              e.clearSelection();
            });
            clipboardResponse.on('error', function () {
              outputCopyResponse.classList.remove("hidden");
              outputCopyResponse.classList.add("text-red-default");
              outputCopyResponse.textContent = "${t("responseTemplate.errorrCopyingToClipboard", {
                lng: lang || "en",
              })}";
            });
          });
      `,
    },
  });

  return (
    <>
      <nav
        id={`navTitle${capitalizedLang}`}
        tabIndex={-1}
        className="flex items-center"
        aria-labelledby={`navTitle${capitalizedLang}`}
      >
        <div
          id={`navTitle${capitalizedLang}`}
          className="mr-4 bg-gray-800 py-1 pl-3 pr-4 text-white"
        >
          {t("responseTemplate.jumpTo", { lng: lang })}
        </div>
        <ul className="flex list-none p-0">
          <li className="mr-4">
            <a href={`#columnTable${capitalizedLang}`}>
              {t("responseTemplate.columnTable", { lng: lang })}
            </a>
          </li>
          <li className="mr-4">
            <a href={`#rowTable${capitalizedLang}`}>
              {t("responseTemplate.rowTable", { lng: lang })}
            </a>
          </li>
          <li className="mr-4">
            <a href={`#confirmReceipt${capitalizedLang}`}>
              {t("responseTemplate.confirmReceipt", { lng: lang })}
            </a>
          </li>
        </ul>
      </nav>

      <h2 className="gc-h1 mt-20">{String(form[getProperty("title", lang)])}</h2>
      <h3 id={`columnTable${capitalizedLang}`} className="gc-h2 mt-20" tabIndex={-1}>
        {t("responseTemplate.columnTable", { lng: lang })}
      </h3>
      <ColumnTable
        responseID={responseID}
        submissionDate={submissionDate}
        submission={formResponse}
        lang={lang}
        data-clipboard-text=""
      />

      <h3 id={`rowTable${capitalizedLang}`} className="gc-h2 mt-20" tabIndex={-1}>
        {t("responseTemplate.rowTable", { lng: lang })}
      </h3>
      <p className="mt-8">{t("responseTemplate.rowTableInfo", { lng: lang })}</p>
      <div className="mb-8 mt-4">
        <button
          id={`copyResponseButton${capitalizedLang}`}
          aria-labelledby={`copyResponseLabel${capitalizedLang}`}
          className="gc-button--blue"
          type="button"
          data-clipboard-text=""
        >
          {t("responseTemplate.copyResponse", { lng: lang })}
        </button>
        <span
          id={`copyResponseOutput${capitalizedLang}`}
          aria-live="polite"
          className="ml-8 hidden text-green"
        ></span>
      </div>

      <RowTable
        responseID={responseID}
        submissionDate={submissionDate}
        submission={formResponse}
        lang={lang}
      />

      <h3 id={`confirmReceipt${capitalizedLang}`} className="gc-h2 mt-20">
        {t("responseTemplate.confirmReceiptResponse", { lng: lang })}
      </h3>
      <p className="mt-4" id={`confirmReceiptInfo${capitalizedLang}`}>
        {t("responseTemplate.confirmReceiptInfo", { lng: lang })}
      </p>
      <div id={`confirmReceiptCodeText${capitalizedLang}`} className="mt-8 font-bold">
        {confirmReceiptCode}
      </div>
      <div className="mb-32 mt-4">
        <button
          id={`copyCodeButton${capitalizedLang}`}
          className="gc-button--blue"
          type="button"
          aria-labelledby={`confirmReceiptInfo${capitalizedLang}`}
          data-clipboard-text={confirmReceiptCode}
        >
          {t("responseTemplate.copyCode", { lng: lang })}
        </button>
        <span
          id={`copyCodeOutput${capitalizedLang}`}
          aria-live="polite"
          className="ml-8 hidden text-green"
        ></span>
      </div>

      {CopyToClipboardScripts}
    </>
  );
};
