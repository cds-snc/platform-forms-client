import React from "react";
import { Submission } from "@lib/responseDownloadFormats/types";
import { getProperty } from "@lib/i18nHelpers";
import { formatDate } from "@lib/client/clientHelpers";
import { newLineToHtml } from "@lib/utils/newLineToHtml";

export interface TableHeader {
  title: string;
  type: string;
}

export const AggregatedTable = ({
  lang = "en",
  headers,
  submissions,
}: {
  lang?: string;
  headers: TableHeader[];
  submissions: Submission[];
}) => {
  const capitalizedLang = lang === "en" ? "En" : "Fr";

  return (
    <table id={`responseTableRow${capitalizedLang}`} className="table-fixed text-left">
      <thead>
        <tr key="" className="flex">
          {headers.map(({ title, type }) => (
            <th
              key=""
              className={`${type === "dynamicRow" ? "w-96" : "w-64"} break-words p-4 font-bold`}
            >
              {title}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission: Submission, index) => {
          return (
            <tr
              key=""
              className={`flex border-t-2 border-t-gray-300 ${
                index % 2 !== 0 ? "bg-slate-50" : ""
              }`}
            >
              <td className="w-64 break-words p-4">
                <a href={`#${submission.id}`} className="tableLink">
                  {submission.id}
                </a>
              </td>
              <td className="w-64 break-words p-4">{formatDate(new Date(submission.createdAt))}</td>
              {submission.answers &&
                submission.answers.map((item) => {
                  if (Array.isArray(item.answer)) {
                    return (
                      <td key="" className="w-96 break-words pl-4">
                        <table className="ml-4 table-fixed text-left">
                          {item.answer.map((subItem) => {
                            return (
                              Array.isArray(subItem) &&
                              subItem.map((subSubItem) => {
                                const question = String(subSubItem[getProperty("question", lang)]);
                                const response = subSubItem.answer;
                                return (
                                  <tr key="" className="flex">
                                    <th className="w-64 break-words p-4">{question}</th>
                                    <td className="break-words p-4">
                                      <span
                                        dangerouslySetInnerHTML={{
                                          __html: newLineToHtml(response),
                                        }}
                                      ></span>
                                    </td>
                                  </tr>
                                );
                              })
                            );
                          })}
                        </table>
                      </td>
                    );
                  }
                  return (
                    <td key="" className="w-64 break-words p-4">
                      <span
                        dangerouslySetInnerHTML={{
                          __html: newLineToHtml(item.answer),
                        }}
                      ></span>
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
