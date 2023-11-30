import React from "react";
import { capitalize } from "./ResponseSection";
import { customTranslate, orderLangugeStrings } from "../../helpers";
import { Answer, Submission } from "../../types";
import { TableProps } from "../types";

const QuestionColumns = ({
  submission,
  lang,
}: {
  submission: Submission;
  lang: string;
}): JSX.Element => {
  const renderRow = (index: number, lang: string, item: Answer) => {
    return (
      <div className="flex w-full flex-row border-b border-gray py-4">
        <dt key="" className="w-120 py-4 font-bold">
          {orderLangugeStrings({ stringEn: item.questionEn, stringFr: item.questionFr, lang })}
        </dt>
        <dd className={`py-4 pl-8`}>{String(item.answer) || "-"}</dd>
      </div>
    );
  };

  const answers = submission.answers.map((item, index) => {
    if (typeof item.answer === "string") {
      return renderRow(index, lang, item);
    } else {
      return (
        <div key={`col-${index}-${lang}`}>
          <dt className="w-full py-4 font-bold">
            {orderLangugeStrings({ stringEn: item.questionEn, stringFr: item.questionFr, lang })}
          </dt>
          <dd className="w-full py-4 pl-16">
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
  const { responseID, submissionDate, submission, lang = "en" } = props;
  const formattedSubmissionDate =
    new Date(submissionDate).toISOString().replace("T", " ").slice(0, -5) + " UTC";

  return (
    <dl id={`responseTableCol${capitalize(lang)}`} className="border-y-2 border-gray">
      <div className="flex border-b border-gray py-4">
        <dt className="w-120 py-4 font-bold">
          {orderLangugeStrings({
            stringEn: t("responseTemplate.responseNumber", { lng: "en" }),
            stringFr: t("responseTemplate.responseNumber", { lng: "fr" }),
            lang,
          })}
        </dt>
        <dd className="py-4 pl-8">{responseID}</dd>
      </div>
      <div className="flex border-b border-gray py-4">
        <dt className="w-120 py-4 font-bold">
          {orderLangugeStrings({
            stringEn: t("responseTemplate.submissionDate", { lng: "en" }),
            stringFr: t("responseTemplate.submissionDate", { lng: "fr" }),
            lang,
          })}
        </dt>
        <dd className="py-4 pl-8">{formattedSubmissionDate}</dd>
      </div>
      <QuestionColumns submission={submission} lang={lang} />
    </dl>
  );
};
