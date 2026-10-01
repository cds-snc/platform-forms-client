export type CollectedAttachment = {
  id: string;
  name: string;
  downloadLink: string;
  isPotentiallyMalicious?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isCollectedAttachment = (value: unknown): value is CollectedAttachment =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.name === "string" &&
  typeof value.downloadLink === "string";

export const collectAttachments = (...values: unknown[]): CollectedAttachment[] => {
  const attachments = new Map<string, CollectedAttachment>();

  const collect = (value: unknown) => {
    if (isCollectedAttachment(value)) {
      attachments.set(value.id, {
        id: value.id,
        name: value.name,
        downloadLink: value.downloadLink,
        ...(typeof value.isPotentiallyMalicious === "boolean" && {
          isPotentiallyMalicious: value.isPotentiallyMalicious,
        }),
      });
      return;
    }

    if (Array.isArray(value)) {
      value.forEach(collect);
      return;
    }

    if (isRecord(value)) Object.values(value).forEach(collect);
  };

  values.forEach(collect);
  return Array.from(attachments.values());
};
