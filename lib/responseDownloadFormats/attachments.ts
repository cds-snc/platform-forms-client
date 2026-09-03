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
  const lastDot = filename.lastIndexOf(".");
  const base = lastDot > 0 ? filename.slice(0, lastDot) : filename;
  const extension = lastDot > 0 ? filename.slice(lastDot) : "";

  let candidate = filename || `attachment-${index + 1}`;
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
  index: number,
  flat = false
) => {
  const safeResponseId = safePathSegment(responseId, "response");
  const safeFilename = safePathSegment(
    filename.split(/[\\/]/).pop() ?? "",
    `attachment-${index + 1}`
  );
  const uniqueFilename = getUniqueAttachmentFilename(safeFilename, usedNames, index);
  if (flat) return uniqueFilename;

  const folder = isPotentiallyMalicious
    ? [RESPONSE_ATTACHMENTS_FOLDER, safeResponseId, SUSPICIOUS_ATTACHMENTS_FOLDER]
    : [RESPONSE_ATTACHMENTS_FOLDER, safeResponseId];

  return [...folder, uniqueFilename].join("/");
};

export const addResponseAttachmentsToZip = async (
  zip: JSZip,
  groups: ResponseAttachmentGroup[] | undefined,
  flat = false
) => {
  const files = await Promise.all(
    (groups ?? []).flatMap((group) => {
      const usedNames = new Set<string>();
      return group.attachments.map(async (attachment, index) => {
        const response = await fetch(attachment.downloadLink);
        if (!response.ok) {
          throw new Error(
            `Attachment download failed for ${attachment.name}: ${response.status} ${response.statusText}`
          );
        }

        return {
          path: getAttachmentZipPath(
            group.responseId,
            attachment.name,
            Boolean(attachment.isPotentiallyMalicious),
            usedNames,
            index,
            flat
          ),
          data: await response.blob(),
        };
      });
    })
  );

  files.forEach(({ path, data }) => zip.file(path, data));
};
