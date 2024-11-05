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
  
            // Select only deepest dd elements without any nested dl elements
            var responseItems = Array.from(document.querySelectorAll("#responseTableRow${capitalizedLang} dd:not(:has(dl))"));
            
            // Format with tab separators for Excel copy+paste
            var responseText = responseItems.map(item => {
              var text = item.textContent.trim();
              // Remove unnecessary newlines, tabs, and extra spaces
              return text.replace(/[\\t|\\n]+/g, "").replace(/[ ]{2,}/g, " ");
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
          className="inline-flex items-center rounded-md border-2 border-solid border-blue bg-blue-default p-3 font-medium leading-[24px] text-white-default transition-all duration-150 ease-in-out hover:border-blue-light hover:bg-blue-light hover:text-white-default focus:border-blue-active focus:bg-blue-focus focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-blue-focus active:top-0.5 active:border-black active:bg-black active:text-white-default active:outline-[3px] active:outline-offset-2 active:outline-blue-focus disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light disabled:text-gray-dark"
          id={`copyResponseButton${capitalizedLang}`}
          aria-labelledby={`copyResponseLabel${capitalizedLang}`}
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
          className="inline-flex items-center rounded-md border-2 border-solid border-blue bg-blue-default p-3 font-medium leading-[24px] text-white-default transition-all duration-150 ease-in-out hover:border-blue-light hover:bg-blue-light hover:text-white-default focus:border-blue-active focus:bg-blue-focus focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-blue-focus active:top-0.5 active:border-black active:bg-black active:text-white-default active:outline-[3px] active:outline-offset-2 active:outline-blue-focus disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light disabled:text-gray-dark"
          id={`copyCodeButton${capitalizedLang}`}
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
