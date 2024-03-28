import { ResponseHtml } from "./components/ResponseHtml";
import { FormResponseSubmissions } from "../types";

export const transform = async (formResponseSubmissions: FormResponseSubmissions) => {
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
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

  return records;
};
