import { FormRecord } from "@lib/types";
import { ResponseHtml } from "../html/components/ResponseHtml";
import { renderToStaticMarkup } from "react-dom/server";
import { ResponseSubmission } from "../types";
import JSZip from "jszip";

export const transform = (responses: ResponseSubmission[], fullFormTemplate: FormRecord) => {
  const records = responses.map((response) => {
    return {
      id: response.id,
      created_at: response.created_at,
      html: renderToStaticMarkup(
        ResponseHtml({
          form: fullFormTemplate.form,
          response: response,
          confirmationCode: response.confirmation_code,
          responseID: response.id,
          createdAt: response.created_at,
          securityAttribute: fullFormTemplate.securityAttribute,
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
