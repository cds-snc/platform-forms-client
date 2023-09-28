import xlsx from "node-xlsx";

export const transform = (responses) => {
  const records = responses.map((response) => {
    return Object.values(response);
  });

  records.unshift(Object.keys(responses[0]));

  return xlsx.build([{ name: "Responses", data: records, options: {} }]);
};
