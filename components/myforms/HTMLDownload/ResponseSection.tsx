import React from "react";
import { Table } from "@components/myforms/HTMLDownload/Table";
import { useTranslation } from "next-i18next";
import { FormProperties, Response, Responses, FormElementTypes } from "@lib/types";

export interface ResponseSectionProps {
  confirmReceiptCode: string;
  lang: string;
  responseID: string;
  submissionID: string;
  submissionDate: number;
  formTemplate: FormProperties;
  formResponse: Responses;
}

function capitalize(string: string) {
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
): Response[][] => {
  // Filter out only questions that have possible responses
  const questionsOnly = formTemplate.elements.filter(
    (element) => ![FormElementTypes.richText].includes(element.type)
  );
  return (
    formTemplate.layout
      .map((elementID) => {
        const question = questionsOnly.filter((element) => element.id === elementID)[0]?.properties[
          getProperty("title", lang)
        ];

        // If the question type does not have a possible response it will return undefined here.
        // Short circuit and return undefined to be filtered out in the next step

        if (!question) return;

        const response = formResponse[elementID];
        return [question as string, response];
      })
      // Filter out the undefined from the array.
      .filter((responsePair) => responsePair !== undefined) as Response[][]
  );
};

export const ResponseSection = ({
  confirmReceiptCode,
  lang,
  responseID,
  submissionID,
  submissionDate,
  formTemplate,
  formResponse,
}: ResponseSectionProps) => {
  const { t } = useTranslation(["my-forms"]);
  const capitalizedLang = capitalize(lang);
  const questionsAnswers = parseQuestionsAndAnswers(formTemplate, formResponse, lang);

  const CopyToClipboardScript = React.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `
(function () {
    var btn = document.getElementById("copyCodeButton-${capitalize(lang)}");
    btn.addEventListener("click", function (e) {
        e.preventDefault();
        var el = document.getElementById("copyCodeOutput-${capitalize(lang)}");
        if(window.copyToClipboard("${confirmReceiptCode}")){
          el.classList.remove("hidden");
          el.textContent = "${t("responseTemplate.copiedCode")}";
        } else {
          el.classList.remove("hidden");
          el.classList.add("text-red-default");
          el.textContent = "${t("responseTemplate.copiedCode")}";
        }
    }, false);
})();
      `,
    },
  });

  return (
    <>
      <nav className="flex items-center" aria-labelledby={"navTitle" + capitalizedLang}>
        <div
          id={"navTitle" + capitalizedLang}
          className="mr-4 pl-3 pr-4 py-1 bg-gray-800 text-white"
        >
          {t("responseTemplate.jumpTo", { lng: lang })}
        </div>
        <ul className="flex list-none p-0">
          <li className="mr-4">
            <a href={"#columnTable" + capitalizedLang}>
              {t("responseTemplate.columnTable", { lng: lang })}
            </a>
          </li>
          <li className="mr-4">
            <a href={"#rowTable" + capitalizedLang}>
              {t("responseTemplate.rowTable", { lng: lang })}
            </a>
          </li>
          <li className="mr-4">
            <a href={"#confirmReceipt" + capitalizedLang}>
              {t("responseTemplate.confirmReceipt", { lng: lang })}
            </a>
          </li>
        </ul>
      </nav>

      <h2 className="gc-h1 mt-20">{formTemplate[getProperty("title", lang)]?.toString()}</h2>
      <h3 id={"columnTable" + capitalizedLang} className="gc-h2 mt-20" tabIndex={-1}>
        {t("responseTemplate.columnTable", { lng: lang })}
      </h3>
      <Table
        responseID={responseID}
        submissionDate={submissionDate}
        submissionID={submissionID}
        questionsAnswers={questionsAnswers}
        isRowTable={false}
        lang={capitalizedLang}
      />

      <h3 id={"rowTable" + capitalizedLang} className="gc-h2 mt-20" tabIndex={-1}>
        {t("responseTemplate.rowTable", { lng: lang })}
      </h3>
      <p className="mb-8">{t("responseTemplate.rowTableInfo", { lng: lang })}</p>
      <Table
        responseID={responseID}
        submissionDate={submissionDate}
        submissionID={submissionID}
        questionsAnswers={questionsAnswers}
        isRowTable={true}
        lang={capitalizedLang}
      />

      {/* Note: form semantics not necessary for a single button but adding to make legend 
      description, label.. relationships really obvious for AT */}
      <form>
        <h3 id={"confirmReceipt" + capitalizedLang} className="gc-h2 mt-20">
          {t("responseTemplate.confirmReceiptResponse", { lng: lang })}
        </h3>
        <fieldset>
          <legend className="mt-4" id={"confirmReceiptInfo-" + capitalizedLang}>
            {t("responseTemplate.confirmReceiptInfo", { lng: lang })}
          </legend>
          <div className="mt-8 font-bold">
            <label className="sr-only" htmlFor={"confirmReceiptCodeText-" + capitalizedLang}>
              Confirm Receipt Code
            </label>
            <input
              id={"confirmReceiptCodeText-" + capitalizedLang}
              type="text"
              value={confirmReceiptCode}
              readOnly
            />
          </div>
          <div className="mt-4 mb-32">
            <button
              id={"copyCodeButton-" + capitalizedLang}
              className="gc-button--blue"
              type="button"
            >
              {t("responseTemplate.copyCode", { lng: lang })}
            </button>
            <span
              id={"copyCodeOutput-" + capitalizedLang}
              aria-live="polite"
              className="hidden text-green-default ml-8"
            ></span>
            {CopyToClipboardScript}
          </div>
        </fieldset>
      </form>
    </>
  );
};
