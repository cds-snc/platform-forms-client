// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const transform = (responses: any[]) => {
  const records = responses.map((response) => {
    return Object.values(response);
  });

  let table = "<!DOCTYPE html><html><table><thead><tr>";
  table = table + Object.keys(responses[0]).map((key) => "<th>" + key + "</th>");
  table = table + "</tr></thead><tbody>";
  table =
    table +
    records.map((response) => {
      return "<tr>" + Object.values(response).map((value) => "<td>" + value + "</td>") + "</tr>";
    });

  table = table + "</tbody></table></html>";

  return table;
};
