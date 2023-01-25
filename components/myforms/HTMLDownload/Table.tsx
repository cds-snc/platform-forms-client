import React from "react";
import { useTranslation } from "next-i18next";
import { Response } from "@lib/types";

export interface TableProps {
  isRowTable?: boolean;
  lang?: string;
  responseID: string;
  submissionDate: number;
  submissionID: string;
  questionsAnswers: Response[][];
}

export const Table = (props: TableProps): React.ReactElement => {
  const { t } = useTranslation(["my-forms"]);
  const {
    responseID,
    submissionDate,
    questionsAnswers,
    isRowTable = true,
    lang = "en",
    submissionID,
  } = props;

  return (
    <>
      {!questionsAnswers && <p>{t("responseTemplate.errorNoQuestionsAnswers")}</p>}
      {!isRowTable && questionsAnswers && (
        <dl className="border-b-2 border-t-2 border-grey-default">
          <div className="flex border-b border-grey-default">
            <dt className="w-80 font-bold pt-2 pb-2">
              {t("responseTemplate.responseNumber", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] pt-2 pb-2">{responseID}</dd>
          </div>
          <div className="flex border-b border-grey-default">
            <dt className="w-80 font-bold pt-2 pb-2">
              {t("responseTemplate.submissionDate", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] pt-2 pb-2">
              {new Date(submissionDate).toLocaleString(`${lang + "-CA"}`, {
                timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              })}
            </dd>
          </div>
          <div className="flex border-b border-grey-default">
            <dt className="w-80 font-bold pt-2 pb-2">
              {t("responseTemplate.submissionID", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] pt-2 pb-2">{submissionID}</dd>
          </div>
          {questionsAnswers &&
            questionsAnswers.map(([question, answer], index) => (
              <div key={"col" + index + lang} className="flex border-b border-grey-default">
                <dt className="w-80 pt-2 pb-2 font-bold">{question.toString()}</dt>
                <dd className="max-w-[50rem] pt-2 pb-2">{answer.toString()}</dd>
              </div>
            ))}
        </dl>
      )}
      {isRowTable && questionsAnswers && (
        <dl className="flex overflow-x-auto border-b-2 border-t-2 border-grey-default">
          <div className="flex flex-col min-w-[14rem] max-w-[40rem]">
            <dt className="font-bold border-b border-grey-default pt-2 pb-2">
              {t("responseTemplate.responseNumber", { lng: lang })}
            </dt>
            <dd className="pt-2 pb-2">{responseID}</dd>
          </div>
          <div className="flex flex-col min-w-[14rem] max-w-[40rem]">
            <dt className="font-bold border-b border-grey-default pt-2 pb-2">
              {t("responseTemplate.submissionDate", { lng: lang })}
            </dt>
            <dd className="pt-2 pb-2">{submissionDate}</dd>
          </div>
          {questionsAnswers &&
            questionsAnswers.map(([question, answer], index) => (
              <div key={"row" + index + lang} className="flex flex-col min-w-[14rem] max-w-[40rem]">
                <dt className="font-bold border-b border-grey-default pt-2 pb-2">
                  {question.toString()}
                </dt>
                <dd className="pt-2 pb-2">{answer.toString()}</dd>
              </div>
            ))}
        </dl>
      )}
    </>
  );
};
