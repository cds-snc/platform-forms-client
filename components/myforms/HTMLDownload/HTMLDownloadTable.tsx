import React from "react";
import { useTranslation } from "next-i18next";

export interface HTMLDownloadTableI {
  responseNumber: string;
  submissionDate: string;
  questionsAnswers: Array<any>; //TODO
}

interface HTMLDownloadTableProps extends HTMLDownloadTableI {
  isRowTable?: boolean;
  lang?: string;
}

export const HTMLDownloadTable = (props: HTMLDownloadTableProps): React.ReactElement => {
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
            Object.keys(questionsAnswers).map((key: string, index: number) => (
              <div key={index + key + "row"} className="flex border-b border-grey-default">
                <dt className="w-80 pt-2 pb-2 font-bold">{key}</dt>
                <dd className="max-w-[50rem] pt-2 pb-2">{questionsAnswers[key]}</dd>
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
            Object.keys(questionsAnswers).map((key: string, index: number) => (
              <div key={index + key + "col"} className="flex flex-col min-w-[14rem] max-w-[40rem]">
                <dt className="font-bold border-b border-grey-default pt-2 pb-2">{key}</dt>
                <dd className="pt-2 pb-2">{questionsAnswers[key]}</dd>
              </div>
            ))}
        </dl>
      )}

      {/* TABLE is another option. But a 1-row/col table is weird.
        <p>Response Number: XXX-XXX</p>
        <p>Submission Date: XXXXXXXXX</p>
        <hr/>
        <table>
          <caption>Submission results</caption>
          <tbody>
            {!isRowTable && 
            <>
              <tr>
                <th scope="col">Questions</th>
                <th  scope="col">Answers</th>
              </tr>
              <tr>
                    <th>q1</th>
                    <td>a1</td>
              </tr>
              <tr>
                    <th>q2</th>
                    <td>a2</td>
              </tr>
              <tr>
                    <th>q3</th>
                    <td>a3</td>
              </tr>
            </>
            }
            {isRowTable && 
            <>
              <tr>
                <td rowspan="2"></td>
                <th colspan="3" scope="colgroup" className="select-none">Questions</th>
              </tr>
              <tr>
                <th scope="col">q1</th>
                <th scope="col">q2</th>
                <th scope="col">q3</th>
              </tr>
              <tr>
                <!--
                  Note for multiple submission rows would instead use:
                  <th rowspan="NUMBER_OF_SUBMISSIONS" scope="rowgroup">Answers</th> 
                -->
                <th scope="col" className="select-none">Answers</th>
                <td>a1</td>
                <td>a2</td>
                <td>a3</td>
              </tr>
            </>
            }
          </tbody>
        </table> 
      */}
    </>
  );
};
