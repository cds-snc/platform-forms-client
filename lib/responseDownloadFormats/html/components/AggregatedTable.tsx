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

  // TODO below may be a bit brittle, could use some refactoring
  return (
    <table id={`responseTableRow${capitalizedLang}`} className="table-fixed">
      <thead>
        <tr key="headers">
          {headers.map((heading, index) => (
            <th key={`heading-${heading}-${index}`}>{heading}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {submissions.map((submission: Submission) => {
          return (
            <tr key={submission.id} className={`border-t-2 border-t-grey-300 odd:bg-slate-50`}>
              <td className="min-w-64">{submission.id}</td>
              <td className="min-w-64">{submission.createdAt}</td>
              {submission.answers &&
                submission.answers.map((answer, index) => {
                  if (Array.isArray(answer.answer)) {
                    return (
                      <td key={`answer-col-${index}`} className="min-w-64">
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
                    <td key={`answer-col-${index}`} className="min-w-64">
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
