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

      <h1 className="mt-20">{formTemplate[getProperty("title", lang)]?.toString()}</h1>
      <h2 id={"columnTable" + capitalizedLang} className="mt-20">
        {t("responseTemplate.columnTable", { lng: lang })}
      </h2>
      <Table
        responseID={responseID}
        submissionDate={submissionDate}
        submissionID={submissionID}
        questionsAnswers={questionsAnswers}
        isRowTable={false}
        lang={capitalizedLang}
      />

      <h2 id={"rowTable" + capitalizedLang} className="mt-20">
        {t("responseTemplate.rowTable", { lng: lang })}
      </h2>
      <p className="mb-8">{t("responseTemplate.rowTableInfo", { lng: lang })}</p>
      <Table
        responseID={responseID}
        submissionDate={submissionDate}
        submissionID={submissionID}
        questionsAnswers={questionsAnswers}
        isRowTable={true}
        lang={capitalizedLang}
      />

      <h2 id={"confirmReceipt" + capitalizedLang} className="mt-20">
        {t("responseTemplate.confirmReceiptResponse", { lng: lang })}
      </h2>
      <p className="mt-4" id={"confirmReceiptInfo-" + lang}>
        {t("responseTemplate.confirmReceiptInfo", { lng: lang })}
      </p>
      <div className="mt-8 font-bold">
        <input
          id={"confirmReceiptCodeText-" + lang}
          type="text"
          value={confirmReceiptCode}
          aria-labelledby={"confirmReceiptInfo-" + lang}
          readOnly
        />
      </div>
      <div className="mt-4 mb-32">
        <button
          id={"copyCodeButton-" + lang}
          className="gc-button--blue"
          aria-label={t("responseTemplate.copyCodeClipboard")}
        >
          {t("responseTemplate.copyCode", { lng: lang })}
        </button>
        <span
          id={"copyCodeOutput-" + lang}
          aria-live="polite"
          className="hidden text-green-default ml-8"
        ></span>
      </div>
    </>
  );
};
