import React from "react";
import { useTranslation } from "next-i18next";

export interface TableProps {
  isRowTable?: boolean;
  lang?: string;
  responseNumber: string;
  submissionDate: string;
  questionsAnswers: Array<any>; //TODO
}

export const Table = (props: TableProps): React.ReactElement => {
  const { t } = useTranslation(["my-forms"]);
  const {
    responseNumber,
    submissionDate,
    questionsAnswers,
    isRowTable = true,
    lang = "en",
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
            <dd className="max-w-[50rem] pt-2 pb-2">{responseNumber}</dd>
          </div>
          <div className="flex border-b border-grey-default">
            <dt className="w-80 font-bold pt-2 pb-2">
              {t("responseTemplate.submissionDate", { lng: lang })}
            </dt>
            <dd className="max-w-[50rem] pt-2 pb-2">{submissionDate}</dd>
          </div>
          {questionsAnswers &&
            Object.entries(questionsAnswers).map(([key, value]) => (
              <div key={"col" + key + lang} className="flex border-b border-grey-default">
                <dt className="w-80 pt-2 pb-2 font-bold">{key}</dt>
                <dd className="max-w-[50rem] pt-2 pb-2">{value}</dd>
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
            <dd className="pt-2 pb-2">{responseNumber}</dd>
          </div>
          <div className="flex flex-col min-w-[14rem] max-w-[40rem]">
            <dt className="font-bold border-b border-grey-default pt-2 pb-2">
              {t("responseTemplate.submissionDate", { lng: lang })}
            </dt>
            <dd className="pt-2 pb-2">{submissionDate}</dd>
          </div>
          {questionsAnswers &&
            Object.entries(questionsAnswers).map(([key, value]) => (
              <div key={"row" + key + lang} className="flex flex-col min-w-[14rem] max-w-[40rem]">
                <dt className="font-bold border-b border-grey-default pt-2 pb-2">{key}</dt>
                <dd className="pt-2 pb-2">{value}</dd>
              </div>
            ))}
        </dl>
      )}
    </>
  );
};
