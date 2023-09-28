import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";

export const transform = (responses) => {
  const csvStringifier = createCsvStringifier({
    header: Object.keys(responses[0]),
  });

  const records = responses.map((response) => {
    return Object.values(response);
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
