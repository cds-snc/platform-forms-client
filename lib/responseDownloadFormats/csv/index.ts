import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";
import { ResponseSubmission } from "../types";

export const transform = (responses: ResponseSubmission[]) => {
  const header = responses[0].submission.map((item) => {
    return item.questionEn || "";
  });

  header.unshift("id", "created_at", "confirmation_code");

  const csvStringifier = createCsvStringifier({
    header: header,
  });

  const records = responses.map((response) => {
    return [
      response.id,
      response.created_at,
      response.confirmation_code,
      ...response.submission.map((item) => {
        if (item.answer instanceof Array) {
          return JSON.stringify(item.answer); // need to massage this more
        }
        return item.answer;
      }),
    ];
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
