import { ResponseHtml } from "../html/components/ResponseHtml";
import { renderToStaticMarkup } from "react-dom/server";
import { FormResponseSubmissions } from "../types";
import JSZip from "jszip";

export const transform = (formResponseSubmissions: FormResponseSubmissions) => {
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
  records.forEach((response) => {
    zip.file(`${response.id}.html`, response.html);
  });

  return zip;
};
