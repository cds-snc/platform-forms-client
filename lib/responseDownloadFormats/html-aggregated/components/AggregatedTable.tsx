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
    <table id={`responseTableRow${capitalizedLang}`} className="w-full table-fixed text-left">
      <thead>
        <tr key="">
          {headers.map(({ title, type }) => (
            <th
              key=""
              className={`${type === "dynamicRow" ? "w-96" : "w-64"} break-words p-4 font-bold`}
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
              <td className="w-64 break-words p-4" style={{ maxWidth: "16rem" }}>
                <div className="overflow-hidden">
                  <a href={`#${submission.id}`} className="tableLink">
                    {submission.id}
                  </a>
                </div>
              </td>
              <td className="w-64 break-words p-4" style={{ maxWidth: "16rem" }}>
                <div className="overflow-hidden">{formatDate(new Date(submission.createdAt))}</div>
              </td>
              {submission.answers &&
                submission.answers.map((item) => {
                  if (Array.isArray(item.answer)) {
                    return (
                      <td key="" className="w-96 break-words p-4" style={{ maxWidth: "24rem" }}>
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
                                    return (
                                      <tr key="">
                                        <th
                                          className="w-1/2 break-words p-2"
                                          style={{ maxWidth: "12rem" }}
                                        >
                                          <div className="overflow-hidden">{question}</div>
                                        </th>
                                        <td
                                          className="w-1/2 break-words p-2"
                                          style={{ maxWidth: "12rem" }}
                                        >
                                          <div className="overflow-hidden">
                                            <span
                                              dangerouslySetInnerHTML={{
                                                __html: newLineToHtml(response),
                                              }}
                                            ></span>
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
                    <td key="" className="w-64 break-words p-4" style={{ maxWidth: "16rem" }}>
                      <div className="overflow-hidden">
                        <span
                          dangerouslySetInnerHTML={{
                            __html: newLineToHtml(item.answer),
                          }}
                        ></span>
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
