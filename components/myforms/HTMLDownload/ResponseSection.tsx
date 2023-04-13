import React from "react";
import { Table } from "@components/myforms/HTMLDownload/Table";
import { useTranslation } from "next-i18next";
import { FormProperties, Response, Responses, FormElementTypes } from "@lib/types";
import { filterUndef } from "@lib/tsUtils";

export interface ResponseSectionProps {
  confirmReceiptCode: string;
  lang: string;
  responseID: string;
  // submissionID: string;
  submissionDate: number;
  formTemplate: FormProperties;
  formResponse: Responses;
}

export function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getProperty(field: string, lang: string): string {
  if (!field) {
    throw new Error("Field does not exist");
  }
  return field + lang.charAt(0).toUpperCase() + lang.slice(1);
}

const parseQuestionsAndAnswers = (
  formTemplate: FormProperties,
  formResponse: Responses,
  lang: string
): {
  question: string;
  response:
    | {
        question: string;
        response: Response[];
        questionType: FormElementTypes;
      }[]
    | Response;
  questionType: FormElementTypes;
}[] => {
  // Filter out only questions that have possible responses
  const questionsOnly = formTemplate.elements.filter(
    (element) => ![FormElementTypes.richText].includes(element.type)
  );
  // Filters out any undefined entries caused by richtext elements
  return filterUndef(
    formTemplate.layout.map((elementID, index) => {
      const question = questionsOnly.filter((element) => element.id === elementID)[0]?.properties[
        getProperty("title", lang)
      ] as string;

      // If the question type does not have a possible response it will return undefined here.
      // Short circuit and return undefined to be filtered out in the next step

      if (!question) return;

      const response = formResponse[elementID];
      const questionType = formTemplate.elements[index].type;
      if (questionType === FormElementTypes.dynamicRow) {
        // Remove the rich text fields and parse the questions and answers
        const nonRichTextElements = formTemplate.elements[index].properties.subElements?.filter(
          (element) => ![FormElementTypes.richText].includes(element.type)
        );
        // If dynamic row does not have answerable subelements
        // Short circuit and return undefined to be filtered out in the next step
        if (!nonRichTextElements || nonRichTextElements?.length === 0) {
          return;
        }

        const dynamicRowResponse = nonRichTextElements.map((element, index) => {
          const question = element.properties[getProperty("title", lang)] as string;
          const response = (formResponse[elementID] as Record<string, Response>[]).map((answer) => {
            return answer[index];
          });
          return { question, response, questionType: element.type };
        });
        return { question, response: dynamicRowResponse, questionType };
      }
      return { question, response, questionType };
    })
  );
};

export const ResponseSection = ({
  confirmReceiptCode,
  lang,
  responseID,
  // submissionID,
  submissionDate,
  formTemplate,
  formResponse,
}: ResponseSectionProps) => {
  const { t } = useTranslation(["my-forms"]);
  const capitalizedLang = capitalize(lang);
  const questionsAnswers = parseQuestionsAndAnswers(formTemplate, formResponse, lang);

  const CopyToClipboardScripts = React.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `
          document.addEventListener("DOMContentLoaded", function() {
            // Copy Code
            var btnCopyCode = document.getElementById("copyCodeButton${capitalizedLang}");
            var outputCopyCode = document.getElementById("copyCodeOutput${capitalizedLang}");
            var clipboardCode = new ClipboardJS("#copyCodeButton${capitalizedLang}");
            clipboardCode.on('success', function () {
              outputCopyCode.classList.remove("hidden");
              outputCopyCode.textContent = "${t("responseTemplate.copiedToCipboard")}";
              e.clearSelection();
            });
            clipboardCode.on('error', function (e) {
              outputCopyCode.classList.remove("hidden");
              outputCopyCode.classList.add("text-red-default");
              outputCopyCode.textContent = "${t("responseTemplate.errorrCopyingToClipboard")}";
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
            clipboardResponse.on('success', function () {
              outputCopyResponse.classList.remove("hidden");
              outputCopyResponse.textContent = "${t("responseTemplate.copiedToCipboard")}";
              e.clearSelection();
            });
            clipboardResponse.on('error', function (e) {
              outputCopyResponse.classList.remove("hidden");
              outputCopyResponse.classList.add("text-red-default");
              outputCopyResponse.textContent = "${t("responseTemplate.errorrCopyingToClipboard")}";
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
          className="mr-4 pl-3 pr-4 py-1 bg-gray-800 text-white"
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

      <h2 className="gc-h1 mt-20">{formTemplate[getProperty("title", lang)]?.toString()}</h2>
      <h3 id={`columnTable${capitalizedLang}`} className="gc-h2 mt-20" tabIndex={-1}>
        {t("responseTemplate.columnTable", { lng: lang })}
      </h3>
      <Table
        responseID={responseID}
        submissionDate={submissionDate}
        // submissionID={submissionID}
        questionsAnswers={questionsAnswers}
        isRowTable={false}
        lang={lang}
        data-clipboard-text=""
      />

      <h3 id={`rowTable${capitalizedLang}`} className="gc-h2 mt-20" tabIndex={-1}>
        {t("responseTemplate.rowTable", { lng: lang })}
      </h3>
      <p className="mt-8">{t("responseTemplate.rowTableInfo", { lng: lang })}</p>
      <div className="mt-4 mb-8">
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
          className="hidden text-green-default ml-8"
        ></span>
      </div>
      <Table
        responseID={responseID}
        submissionDate={submissionDate}
        // submissionID={submissionID}
        questionsAnswers={questionsAnswers}
        isRowTable={true}
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
      <div className="mt-4 mb-32">
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
          className="hidden text-green-default ml-8"
        ></span>
      </div>

      {CopyToClipboardScripts}
    </>
  );
};
