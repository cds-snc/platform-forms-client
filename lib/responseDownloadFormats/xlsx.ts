import xlsx from "node-xlsx";
import { ResponseSubmission } from "./types";

export const transform = (responses: ResponseSubmission[]) => {
  const records = responses.map((response) => {
    return Object.values(response);
  });

  records.unshift(Object.keys(responses[0]));

  return xlsx.build([{ name: "Responses", data: records, options: {} }]);
};
