import { ResponseHtml } from "../html/components/ResponseHtml";
import { renderToStaticMarkup } from "react-dom/server";
import { FormResponseSubmissions } from "../types";
import JSZip from "jszip";
import { transform as transformAggregated } from "../html-aggregated";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
  const aggregated = transformAggregated(formResponseSubmissions);
  const records = formResponseSubmissions.submissions.map((response) => {
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

  const zip = new JSZip();
  zip.file("receipt-recu.html", aggregated);
  records.forEach((response) => {
    zip.file(`${response.id}.html`, response.html);
  });

  return zip;
};
