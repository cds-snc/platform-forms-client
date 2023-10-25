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

  let table = "<!DOCTYPE html><html><table><thead><tr>";
  table = table + header.map((heading) => "<th>" + heading + "</th>");
  table = table + "</tr></thead><tbody>";
  table =
    table +
    records.map((response) => {
      return "<tr>" + Object.values(response).map((value) => "<td>" + value + "</td>") + "</tr>";
    });

  table = table + "</tbody></table></html>";

  return table;
};
