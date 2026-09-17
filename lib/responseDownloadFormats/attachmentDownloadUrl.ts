export const getResponseAttachmentsUrl = ({
  origin,
  locale,
  formId,
  responseId,
}: {
  origin: string;
  locale: string;
  formId: string;
  responseId: string;
}) =>
  `${origin}/${locale}/form-builder/${encodeURIComponent(formId)}/response-attachments/${encodeURIComponent(responseId)}`;
