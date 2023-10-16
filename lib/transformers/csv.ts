import { createArrayCsvStringifier as createCsvStringifier } from "csv-writer";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transform = (responses: any[]) => {
  const csvStringifier = createCsvStringifier({
    header: Object.keys(responses[0]),
  });

  const records = responses.map((response) => {
    return Object.values(response);
  });

  return csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
};
