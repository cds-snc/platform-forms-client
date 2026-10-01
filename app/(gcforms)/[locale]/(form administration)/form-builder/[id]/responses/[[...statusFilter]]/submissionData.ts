import { collectAttachments } from "@lib/responseAttachments/collectAttachments";

const parseRecord = (value: unknown): Record<string, unknown> => {
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value !== "string") return {};

  try {
    const parsed = JSON.parse(value);
    return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

export const getSubmissionData = (formSubmission: unknown, fileAttachments?: unknown) => {
  const parsedSubmission = parseRecord(formSubmission);
  const answers = parseRecord(parsedSubmission.answers ?? parsedSubmission);

  return {
    answers,
    attachments: collectAttachments(
      parsedSubmission.attachments,
      parsedSubmission.fileAttachments,
      fileAttachments
    ),
  };
};
