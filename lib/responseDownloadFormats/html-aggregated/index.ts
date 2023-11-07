import { renderToStaticMarkup } from "react-dom/server";
import { FormResponseSubmissions } from "../types";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const form = formResponseSubmissions.form;

  const header = formResponseSubmissions.submissions[0].answers.map((item) => {
    return item.questionEn || "";
  });

  header.unshift("id", "created_at", "confirmation_code");

  const records = formResponseSubmissions.submissions.map((response) => {
    return [
      response.id,
      response.createdAt,
      response.confirmationCode,
      ...response.answers.map((item) => {
        if (item.answer instanceof Array) {
          return JSON.stringify(item.answer); // need to massage this more
        }
        return item.answer;
      }),
    ];
  });

  const codes = formResponseSubmissions.submissions.map((response) => response.confirmationCode);

  // let table = "<!DOCTYPE html><html><table><thead><tr>";
  // table = table + header.map((heading) => "<th>" + heading + "</th>");
  // table = table + "</tr></thead><tbody>";
  // table =
  //   table +
  //   records.map((response) => {
  //     return "<tr>" + Object.values(response).map((value) => "<td>" + value + "</td>") + "</tr>";
  //   });
  // table = table + "</tbody></table></html>";
  // return table;

  const response = {
    id: form.id,
    // html: renderToStaticMarkup(
    //   ResponseHtmlAggregated({
    //       form:formResponseSubmissions.form,
    //       responsesTableFormat,
    //       responsesDlFormat,
    //       // response: response,
    //       confirmationCodes,
    //       securityAttribute: formResponseSubmissions.securityAttribute,
    //   })
    // )
  }

  return response;
};
