import { ResponseHtml } from "./components/ResponseHtml";
import { FormResponseSubmissions } from "../types";
import { serverTranslation } from "@root/i18n";

export const transform = async (formResponseSubmissions: FormResponseSubmissions) => {
  const { t } = await serverTranslation("my-forms");
  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
  const records = formResponseSubmissions.submissions.map((response) => {
    return {
      id: response.id,
      created_at: response.createdAt,
      html: renderToStaticMarkup(
        ResponseHtml({
          response: response,
          formRecord: formResponseSubmissions.formRecord,
          confirmationCode: response.confirmationCode,
          responseID: response.id,
          createdAt: response.createdAt,
          securityAttribute: formResponseSubmissions.formRecord.securityAttribute,
          t,
        })
      ),
    };
  });

  return records;
};
