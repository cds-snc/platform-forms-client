/*--------------------------------------------*
 * Local Relative
 *--------------------------------------------*/
import { getSubmissionsByFormat } from "../../../actions";
import type { AttachmentDownloadLinkRefresherOptions } from "./DownloadDialog.types";

export const createAttachmentDownloadLinkRefresher = ({
  formId,
  format,
  language,
  version,
}: AttachmentDownloadLinkRefresherOptions) => {
  // Attachment links are short-lived; the ZIP helper calls this only after a 403 response.
  return async (responseId: string, attachmentId: string) => {
    const refreshedResponse = await getSubmissionsByFormat({
      formID: formId,
      ids: [responseId],
      format,
      lang: language,
      version,
      includeResponses: false,
      includeAttachments: true,
      includeCsvHeader: false,
      trackDownload: false,
    });

    if (
      typeof refreshedResponse !== "object" ||
      !refreshedResponse ||
      Array.isArray(refreshedResponse) ||
      "error" in refreshedResponse ||
      !("attachments" in refreshedResponse)
    ) {
      return undefined;
    }

    return refreshedResponse.attachments
      ?.find((group) => group.responseId === responseId)
      ?.attachments.find((attachment) => attachment.id === attachmentId)?.downloadLink;
  };
};
