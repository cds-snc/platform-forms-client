import { ResponseHtml } from "../html/components/ResponseHtml";
import { renderToStaticMarkup } from "react-dom/server";
import { FormResponseSubmissions } from "../types";
import { transform as transformAggregated } from "../html-aggregated";

export const transform = (formResponseSubmissions: FormResponseSubmissions, lang = "en") => {
  const receipt = transformAggregated(formResponseSubmissions, lang);
  const responses = formResponseSubmissions.submissions.map((response) => {
    return {
      id: response.id,
      created_at: response.createdAt,
      html: renderToStaticMarkup(
        ResponseHtml({
          response: response,
          form: formResponseSubmissions.form,
          confirmationCode: response.confirmationCode,
          responseID: response.id,
          createdAt: response.createdAt,
          securityAttribute: formResponseSubmissions.form.securityAttribute,
        })
      ),
    };
  });

  return {
    receipt,
    responses,
  };
};
