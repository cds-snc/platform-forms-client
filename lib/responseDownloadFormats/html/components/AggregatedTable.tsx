import React from "react";
import { Submission } from "@lib/responseDownloadFormats/types";

export const AggregatedTable = ({
  headers,
  submissions,
}: {
  headers: string[];
  submissions: Submission[];
}) => {
  function formatAnswer(answer: string) {
    return answer || "-";
  }

  return (
    <table>
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
            <tr key={submission.id}>
              <td>{submission.id}</td>
              <td>{submission.createdAt}</td>
              {submission.answers &&
                submission.answers.map((answer, index) => {
                  if (Array.isArray(answer.answer)) {
                    return (
                      <td key={`answer-col-${index}`}>
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
                  return <td key={`answer-col-${index}`}>{formatAnswer(answer.answer)}</td>;
                })}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
