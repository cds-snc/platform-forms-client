import type { ResponseAttachment } from "@lib/responseDownloadFormats/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const parseRecord = (value: unknown): Record<string, unknown> => {
  if (isRecord(value)) return value;
  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

const isResponseAttachment = (value: unknown): value is ResponseAttachment =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.downloadLink === "string";

export const getSubmissionData = (formSubmission: unknown, fileAttachments?: unknown) => {
  const parsedSubmission = parseRecord(formSubmission);
  const answers = parseRecord(parsedSubmission.answers ?? parsedSubmission);
  const attachments = new Map<string, ResponseAttachment>();

  const addAttachment = (value: unknown) => {
    if (!isResponseAttachment(value)) return;

    attachments.set(value.id, {
      id: value.id,
      name: value.name,
      downloadLink: value.downloadLink,
      ...(typeof value.isPotentiallyMalicious === "boolean" && {
        isPotentiallyMalicious: value.isPotentiallyMalicious,
      }),
    });
  };

  const collectAttachments = (value: unknown) => {
    if (isResponseAttachment(value)) {
      addAttachment(value);
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(addAttachment);
      return;
    }

    if (isRecord(value)) Object.values(value).forEach(addAttachment);
  };

  collectAttachments(parsedSubmission.attachments);
  collectAttachments(parsedSubmission.fileAttachments);
  collectAttachments(fileAttachments);

  return { answers, attachments: Array.from(attachments.values()) };
};
