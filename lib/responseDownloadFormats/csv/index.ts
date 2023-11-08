import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";
import { FormResponseSubmissions } from "../types";
import { csvHeaderRow } from "./csvHeaderRow";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const header = formResponseSubmissions.submissions[0].answers.map((item) => {
    return `${item.questionEn} \n ${item.questionFr}`;
  });

  header.unshift(...csvHeaderRow);

  const csvStringifier = createCsvStringifier({
    header: header,
  });

  const records = formResponseSubmissions.submissions.map((response) => {
    return [
      response.id,
      response.createdAt,
      response.confirmationCode,
      ...response.answers.map((item) => {
        if (item.answer instanceof Array) {
          return item.answer
            .map((answer) =>
              answer
                .map(
                  (subAnswer) =>
                    `${subAnswer.questionEn}\n${subAnswer.questionFr}: ${subAnswer.answer}\n`
                )
                .join("")
            )
            .join("\n");
        }
        return item.answer;
      }),
    ];
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
