import React from "react";
import { Submission } from "@lib/responseDownloadFormats/types";

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

  function formatAnswer(answer: string) {
    return answer || "-";
  }

  return (
    <table id={`responseTableRow${capitalizedLang}`} className="table-fixed text-left">
      <thead>
        <tr key="headers" className="flex">
          {headers.map(({ title, type }, index) => (
            <th
              key={`heading-${title}-${index}`}
              className={`${type === "dynamicRow" ? "w-120" : "w-64"} p-4 font-bold`}
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
              key={submission.id}
              className={`flex border-t-2 border-t-grey-300 ${
                index % 2 !== 0 ? "bg-slate-50" : ""
              }`}
            >
              <td className="w-64 p-4">{submission.id}</td>
              <td className="w-64 p-4">{submission.createdAt}</td>
              {submission.answers &&
                submission.answers.map((answer, index) => {
                  if (Array.isArray(answer.answer)) {
                    return (
                      <td key={`answer-col-${index}`} className="w-120 pl-4">
                        <table className="table-fixed text-left ml-4">
                          {answer.answer.map((subAnswer) => {
                            return subAnswer.map((subSubAnswer) => {
                              const question = String(subSubAnswer["question" + capitalizedLang]);
                              const response = subSubAnswer.answer;
                              return (
                                <tr
                                  key={`sub-answer-row-${subSubAnswer.questionEn}-${subSubAnswer.answer}`}
                                  className="flex"
                                >
                                  <th className="w-64 p-4">{question}</th>
                                  <td className="p-4">{formatAnswer(response as string)}</td>
                                </tr>
                              );
                            });
                          })}
                        </table>
                      </td>
                    );
                  }
                  return (
                    <td key={`answer-col-${index}`} className="w-64 p-4">
                      {formatAnswer(answer.answer)}
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
