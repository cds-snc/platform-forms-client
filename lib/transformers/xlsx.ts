import xlsx from "node-xlsx";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transform = (responses: any[]) => {
  const records = responses.map((response) => {
    return Object.values(response);
  });

  records.unshift(Object.keys(responses[0]));

  return xlsx.build([{ name: "Responses", data: records, options: {} }]);
};
