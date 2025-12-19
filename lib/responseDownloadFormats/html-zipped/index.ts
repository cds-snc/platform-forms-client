import { ResponseHtml } from "../html/components/ResponseHtml";

import { FormResponseSubmissions } from "../types";
import { transform as transformAggregated } from "../html-aggregated";
import { serverTranslation } from "@root/i18n";

export const transform = async (formResponseSubmissions: FormResponseSubmissions, lang = "en") => {
  const { t } = await serverTranslation("my-forms");

  const renderToStaticMarkup = (await import("react-dom/server")).renderToStaticMarkup;
  const receipt = await transformAggregated(formResponseSubmissions, lang);
  const responses = formResponseSubmissions.submissions.map((response) => {
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

  return {
    receipt,
    responses,
  };
};
