import xlsx from "node-xlsx";
import { ResponseSubmission } from "../types";

export const transform = (responses: ResponseSubmission[]) => {
  const header = responses[0].submission.map((item) => {
    return item.questionEn || "";
  });

  header.unshift("id", "created_at", "confirmation_code");

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

  records.unshift(header);

  return xlsx.build([{ name: "Responses", data: records, options: {} }]);
};
