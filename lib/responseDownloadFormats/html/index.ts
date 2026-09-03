import { ResponseHtml } from "./components/ResponseHtml";
import { FormResponseSubmissions } from "../types";
import { serverTranslation } from "@i18n";
import { getOrigin } from "@lib/origin";
import { getResponseAttachmentsUrl } from "../attachmentDownloadUrl";

export const transform = async (formResponseSubmissions: FormResponseSubmissions) => {
  const { t } = await serverTranslation("my-forms");
  const hasAttachments = formResponseSubmissions.submissions.some(
    (response) => response.attachments?.length
  );
  const configuredOrigin = process.env.HOST_URL?.trim().replace(/\/+$/, "");
  const origin = hasAttachments ? (configuredOrigin ?? (await getOrigin())) : "";
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
          responseAttachmentsUrl: response.attachments?.length
            ? getResponseAttachmentsUrl({
                origin,
                locale: "en",
                formId: formResponseSubmissions.formRecord.id,
                responseId: response.id,
              })
            : undefined,
          t,
        })
      ),
      ...(response.attachments?.length ? { attachments: response.attachments } : {}),
    };
  });

  return records;
};
