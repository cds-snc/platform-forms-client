import type JSZip from "jszip";
import type { ResponseAttachmentGroup } from "./types";

export const RESPONSE_ATTACHMENTS_FOLDER = "file_attachments-fichiers_joints";
export const SUSPICIOUS_ATTACHMENTS_FOLDER = "suspicious_files-fichiers_suspects";

const safePathSegment = (value: string, fallback: string) => {
  const segment = value
    .replace(/[\\/\0]/g, "_")
    .replace(/^\.+$/, "_")
    .trim();
  return segment || fallback;
};

export const getUniqueAttachmentFilename = (
  filename: string,
  usedNames: Set<string>,
  index: number
) => {
  const safeFilename = safePathSegment(
    filename.split(/[\\/]/).pop() ?? "",
    `attachment-${index + 1}`
  );
  const lastDot = safeFilename.lastIndexOf(".");
  const base = lastDot > 0 ? safeFilename.slice(0, lastDot) : safeFilename;
  const extension = lastDot > 0 ? safeFilename.slice(lastDot) : "";

  let candidate = safeFilename;
  let duplicateIndex = 1;
  while (usedNames.has(candidate)) {
    candidate = `${base} (${duplicateIndex})${extension}`;
    duplicateIndex += 1;
  }

  usedNames.add(candidate);
  return candidate;
};

export const getAttachmentZipPath = (
  responseId: string,
  filename: string,
  isPotentiallyMalicious: boolean,
  usedNames: Set<string>,
  index: number
) => {
  const safeResponseId = safePathSegment(responseId, "response");
  const uniqueFilename = getUniqueAttachmentFilename(filename, usedNames, index);
  const folders = isPotentiallyMalicious
    ? [RESPONSE_ATTACHMENTS_FOLDER, safeResponseId, SUSPICIOUS_ATTACHMENTS_FOLDER]
    : [RESPONSE_ATTACHMENTS_FOLDER, safeResponseId];

  return [...folders, uniqueFilename].join("/");
};

export const addResponseAttachmentsToZip = async (
  zip: JSZip,
  groups: ResponseAttachmentGroup[] | undefined
) => {
  await Promise.all(
    (groups ?? []).flatMap((group) => {
      const usedNames = new Set<string>();

      return group.attachments.map(async (attachment, index) => {
        const path = getAttachmentZipPath(
          group.responseId,
          attachment.name,
          attachment.isPotentiallyMalicious,
          usedNames,
          index
        );
        const response = await fetch(attachment.downloadLink);
        if (!response.ok) {
          throw new Error(`Attachment download failed: ${response.status} ${response.statusText}`);
        }

        zip.file(path, await response.blob());
      });
    })
  );
};
