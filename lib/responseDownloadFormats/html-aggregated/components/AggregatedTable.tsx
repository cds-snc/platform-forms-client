import React from "react";
import { Submission } from "@lib/responseDownloadFormats/types";

export const AggregatedTable = ({
  lang = "en",
  headers,
  submissions,
}: {
  lang?: string;
  headers: string[];
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
          {headers.map((heading, index) => (
            <th key={`heading-${heading}-${index}`} className="w-64 p-4 font-bold">
              {heading}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission: Submission, index) => {
          // TODO "odd:bg-slate-50" was working so went with JS way
          return (
            <tr
              key={submission.id}
              className={`flex border-t-2 border-t-grey-300 ${index % 2 != 0 ? "bg-slate-50" : ""}`}
            >
              <td className="w-64 p-4">{submission.id}</td>
              <td className="w-64 p-4">{submission.createdAt}</td>
              {submission.answers &&
                submission.answers.map((answer, index) => {
                  if (Array.isArray(answer.answer)) {
                    return (
                      <td key={`answer-col-${index}`} className="w-64 p-4">
                        <table>
                          {answer.answer.map((subAnswer) => {
                            return subAnswer.map((subSubAnswer) => {
                              return (
                                <tr
                                  key={`sub-answer-row-${subSubAnswer.questionEn}-${subSubAnswer.answer}`}
                                >
                                  <th>{subSubAnswer.questionEn}</th>
                                  <td>{formatAnswer(subSubAnswer.answer)}</td>
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
