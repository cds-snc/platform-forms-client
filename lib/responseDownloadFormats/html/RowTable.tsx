import React from "react";
import { capitalize } from "./ResponseSection";
import { customTranslate } from "../helpers";
import { Answer, ResponseSubmission } from "../types";
import { TableProps } from "./types";
import { getProperty } from "./helpers";

const QuestionRows = ({
  formResponse,
  lang,
}: {
  formResponse: ResponseSubmission;
  lang: string;
}): JSX.Element => {
  const renderColumn = (index: number, lang: string, item: Answer, subItem = false) => {
    return (
      <div className={`flex ${subItem ? "flex-row" : "flex-col"} border-b border-gray`}>
        <dt className="whitespace-nowrap border-b-2 border-gray p-4 font-bold">
          {String(item[getProperty("question", lang)])}
        </dt>
        <dd className="p-4">
          <p>{String(item.answer) || "-"}</p>
        </dd>
      </div>
    );
  };

  const answers = formResponse.submission.map((item, index) => {
    if (typeof item.answer === "string") {
      return renderColumn(index, lang, item);
    } else {
      return (
        <div key={"row" + index + lang}>
          <dt className="whitespace-nowrap border-b-2 border-gray p-4 font-bold">
            {String(item[getProperty("question", lang)])}
          </dt>
          <dd className="w-full p-4">
            <dl className="flex flex-col">
              {item.answer.map((subItem) => {
                return subItem.map((subSubItem, subIndex) => {
                  return renderColumn(subIndex, lang, subSubItem, true);
                });
              })}
            </dl>
          </dd>
        </div>
      );
    }
  });

  return <>{answers}</>;
};

export const RowTable = (props: TableProps): React.ReactElement => {
  const { t } = customTranslate("my-forms");
  const {
    responseID,
    submissionDate,
    formResponse,
    lang = "en",
    // submissionID,
  } = props;
  const formattedSubmissionDate =
    new Date(submissionDate).toISOString().replace("T", " ").slice(0, -5) + " UTC";

  return (
    <div className="overflow-x-scroll">
      <dl
        id={`responseTableRow${capitalize(lang)}`}
        className="flex overflow-x-auto border-y-2 border-gray"
      >
        <div className="flex flex-col">
          <dt className="flex whitespace-nowrap border-b border-gray p-4 font-bold">
            {t("responseTemplate.responseNumber", { lng: lang })}
          </dt>
          <dd className="whitespace-nowrap p-4">{responseID}</dd>
        </div>
        <div className="flex flex-col">
          <dt className="flex whitespace-nowrap border-b border-gray p-4 font-bold">
            {t("responseTemplate.submissionDate", { lng: lang })}
          </dt>
          <dd className="whitespace-nowrap p-4">{formattedSubmissionDate}</dd>
        </div>
        <QuestionRows formResponse={formResponse} lang={lang} />
      </dl>
    </div>
  );
};
