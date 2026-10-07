import type JSZip from "jszip";
import type { ResponseAttachmentGroup } from "./types";
import { getUniqueAttachmentFilename } from "./attachmentFilenames";

export { getUniqueAttachmentFilename } from "./attachmentFilenames";

export const RESPONSE_ATTACHMENTS_FOLDER = "file_attachments-fichiers_joints";
export const SUSPICIOUS_ATTACHMENTS_FOLDER = "suspicious_files-fichiers_suspects";

const safePathSegment = (value: string, fallback: string) => {
  const segment = value
    .replace(/[\\/\0]/g, "_")
    .replace(/^\.+$/, "_")
    .trim();

  return segment || fallback;
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
  flat = false,
  onAttachmentProgress?: (completed: number, total: number) => void
) => {
  const attachments = (groups ?? []).flatMap((group) => group.attachments);
  let completed = 0;
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

        const file = {
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

        completed += 1;
        onAttachmentProgress?.(completed, attachments.length);
        return file;
      });
    })
  );

  files.forEach(({ path, data }) => zip.file(path, data));
};
