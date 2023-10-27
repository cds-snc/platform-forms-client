import React from "react";
import { capitalize } from "./ResponseSection";
import { customTranslate } from "../../helpers";
import { Answer, ResponseSubmission } from "../../types";
import { TableProps } from "../types";
import { getProperty } from "../helpers";

const QuestionColumns = ({
  formResponse,
  lang,
}: {
  formResponse: ResponseSubmission;
  lang: string;
}): JSX.Element => {
  const renderRow = (index: number, lang: string, item: Answer) => {
    return (
      <div className="flex w-full flex-row border-b border-gray">
        <dt className="w-120 py-4 font-bold">{String(item[getProperty("question", lang)])}</dt>
        <dd className={`py-4 pl-8`}>{String(item.answer) || "-"}</dd>
      </div>
    );
  };

  const answers = formResponse.submission.map((item, index) => {
    if (typeof item.answer === "string") {
      return renderRow(index, lang, item);
    } else {
      return (
        <div key={`col-${index}-${lang}`}>
          <dt className="w-full py-4 font-bold">{String(item[getProperty("question", lang)])}</dt>
          <dd className="w-full py-4 pl-8">
            <dl className="ml-8">
              {item.answer.map((subItem) => {
                return subItem.map((subSubItem, subIndex) => {
                  return renderRow(subIndex, lang, subSubItem);
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

export const ColumnTable = (props: TableProps): React.ReactElement => {
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
    <dl id={`responseTableCol${capitalize(lang)}`} className="border-y-2 border-gray">
      <div className="flex border-b border-gray">
        <dt className="w-120 py-4 font-bold">
          {t("responseTemplate.responseNumber", { lng: lang })}
        </dt>
        <dd className="py-4 pl-8">{responseID}</dd>
      </div>
      <div className="flex border-b border-gray">
        <dt className="w-120 py-4 font-bold">
          {t("responseTemplate.submissionDate", { lng: lang })}
        </dt>
        <dd className="py-4 pl-8">{formattedSubmissionDate}</dd>
      </div>
      <QuestionColumns formResponse={formResponse} lang={lang} />
    </dl>
  );
};
