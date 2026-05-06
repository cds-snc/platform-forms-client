import React from "react";
import { Submission } from "@lib/responseDownloadFormats/types";
import { getProperty } from "@lib/i18nHelpers";
import { formatDate } from "@lib/client/clientHelpers";
import { formatUserInput } from "@lib/utils/strings";
import { FormRecord } from "@gcforms/types";
import { Language } from "@lib/types/form-builder-types";
import { formatNumberInputAnswer } from "@lib/responseDownloadFormats/utils/formatNumberInputAnswer";

export interface TableHeader {
  title: string;
  type: string;
}

export const AggregatedTable = ({
  lang = "en",
  headers,
  submissions,
  formRecord,
}: {
  lang?: Language;
  headers: TableHeader[];
  submissions: Submission[];
  formRecord: FormRecord;
}) => {
  const capitalizedLang = lang === "en" ? "En" : "Fr";

  return (
    <table id={`responseTableRow${capitalizedLang}`} className="w-full table-fixed text-left">
      <thead>
        <tr key={`headerRow${capitalizedLang}`}>
          {headers.map(({ title, type }, index) => (
            <th
              key={`headerCell${index}`}
              className={`${type === "dynamicRow" ? "w-96" : "w-64"} p-4 font-bold break-words`}
              style={{ maxWidth: type === "dynamicRow" ? "24rem" : "16rem" }}
            >
              <div className="overflow-hidden">{title}</div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission: Submission, index) => {
          return (
            <tr
              key=""
              className={`border-t-2 border-t-gray-300 ${index % 2 !== 0 ? "bg-slate-50" : ""}`}
            >
              <td className="w-64 p-4 break-words" style={{ maxWidth: "16rem" }}>
                <div className="overflow-hidden">
                  <a href={`#${submission.id}`} className="tableLink">
                    {submission.id}
                  </a>
                </div>
              </td>
              <td className="w-64 p-4 break-words" style={{ maxWidth: "16rem" }}>
                <div className="overflow-hidden">{formatDate(new Date(submission.createdAt))}</div>
              </td>
              {submission.answers &&
                submission.answers.map((item) => {
                  const formattedNumberInput = formatNumberInputAnswer(item, lang, formRecord);
                  if (Array.isArray(item.answer)) {
                    return (
                      <td
                        key={String(item.questionId)}
                        className="w-96 p-4 break-words"
                        style={{ maxWidth: "24rem" }}
                      >
                        <div className="overflow-hidden">
                          <table className="w-full table-fixed text-left">
                            <tbody>
                              {item.answer.map((subItem) => {
                                return (
                                  Array.isArray(subItem) &&
                                  subItem.map((subSubItem) => {
                                    const question = String(
                                      subSubItem[getProperty("question", lang)]
                                    );
                                    const response = subSubItem.answer;
                                    const formattedNumberInput = formatNumberInputAnswer(
                                      subSubItem,
                                      lang,
                                      formRecord
                                    );
                                    return (
                                      <tr key={String(subSubItem.questionId)}>
                                        <th
                                          className="w-1/2 p-2 break-words"
                                          style={{ maxWidth: "12rem" }}
                                        >
                                          <div className="overflow-hidden">{question}</div>
                                        </th>
                                        <td
                                          className="w-1/2 p-2 break-words"
                                          style={{ maxWidth: "12rem" }}
                                        >
                                          <div className="overflow-hidden">
                                            {formattedNumberInput !== undefined ? (
                                              <span>{formattedNumberInput}</span>
                                            ) : (
                                              <span
                                                dangerouslySetInnerHTML={{
                                                  __html: formatUserInput(String(response)),
                                                }}
                                              ></span>
                                            )}
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    );
                  }
                  return (
                    <td
                      key={String(item.questionId)}
                      className="w-64 p-4 break-words"
                      style={{ maxWidth: "16rem" }}
                    >
                      <div className="overflow-hidden">
                        {formattedNumberInput !== undefined ? (
                          <span>{formattedNumberInput}</span>
                        ) : (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: formatUserInput(String(item.answer)),
                            }}
                          ></span>
                        )}
                      </div>
                    </td>
                  );
                })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
