import type JSZip from "jszip";
import type { ResponseAttachmentGroup } from "./types";

export const RESPONSE_ATTACHMENTS_FOLDER = "file_attachments-fichiers_joints";
export const SUSPICIOUS_ATTACHMENTS_FOLDER = "suspicious_files-fichiers_suspects";
const MAPPING_FILENAME = "mapping.json";

const safePathSegment = (value: string, fallback: string) => {
  const segment = value
    .replace(/[\\/\0]/g, "_")
    .replace(/^\.+$/, "_")
    .trim();
  return segment || fallback;
};

const getResponseAttachmentFolderPath = (responseId: string) =>
  `${RESPONSE_ATTACHMENTS_FOLDER}/${safePathSegment(responseId, "response")}`;

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
  const uniqueFilename = getUniqueAttachmentFilename(filename, usedNames, index);
  const responseFolderPath = getResponseAttachmentFolderPath(responseId);
  const attachmentFolderPath = isPotentiallyMalicious
    ? `${responseFolderPath}/${SUSPICIOUS_ATTACHMENTS_FOLDER}`
    : responseFolderPath;

  return `${attachmentFolderPath}/${uniqueFilename}`;
};

export type AttachmentDownloadProgress = {
  completed: number;
  total: number;
  filename?: string;
};

export type FailedAttachmentDownload = {
  responseId: string;
  filename: string;
  reason: string;
};

type AddResponseAttachmentsOptions = {
  onProgress?: (progress: AttachmentDownloadProgress) => void;
  refreshDownloadLink?: (responseId: string, attachmentId: string) => Promise<string | undefined>;
  writeFailureManifest?: boolean;
};

export const addResponseAttachmentsToZip = async (
  zip: JSZip,
  groups: ResponseAttachmentGroup[] | undefined,
  options: AddResponseAttachmentsOptions = {}
): Promise<FailedAttachmentDownload[]> => {
  const attachments = (groups ?? []).flatMap((group) =>
    group.attachments.map((attachment, index) => ({ group, attachment, index }))
  );
  const usedNamesByResponse = new Map<string, Set<string>>();
  const mappingsByResponse = new Map<
    string,
    Map<string, { originalName: string; actualName: string; isPotentiallyMalicious: boolean }>
  >();
  const failures: FailedAttachmentDownload[] = [];
  let completed = 0;

  options.onProgress?.({ completed, total: attachments.length });

  const processAttachment = async ({ group, attachment, index }: (typeof attachments)[number]) => {
    const usedNames = usedNamesByResponse.get(group.responseId) ?? new Set<string>();
    usedNamesByResponse.set(group.responseId, usedNames);
    const path = getAttachmentZipPath(
      group.responseId,
      attachment.name,
      attachment.isPotentiallyMalicious,
      usedNames,
      index
    );

    try {
      let response = await fetch(attachment.downloadLink);
      if (response.status === 403 && options.refreshDownloadLink) {
        const refreshedLink = await options.refreshDownloadLink(group.responseId, attachment.id);
        if (refreshedLink) response = await fetch(refreshedLink);
      }

      if (!response.ok) {
        failures.push({
          responseId: group.responseId,
          filename: attachment.name,
          reason: `HTTP ${response.status}`,
        });
      } else {
        zip.file(path, await response.blob());
        const mapping = mappingsByResponse.get(group.responseId) ?? new Map();
        mapping.set(attachment.id, {
          originalName: attachment.name,
          actualName: path.split("/").pop() ?? attachment.name,
          isPotentiallyMalicious: attachment.isPotentiallyMalicious,
        });
        mappingsByResponse.set(group.responseId, mapping);
      }
    } catch {
      failures.push({
        responseId: group.responseId,
        filename: attachment.name,
        reason: "Download failed",
      });
    }

    completed += 1;
    options.onProgress?.({ completed, total: attachments.length, filename: attachment.name });
  };

  // Process one file at a time to limit in-flight memory and preserve earlier ZIP entries on failure.
  await attachments.reduce(async (previous, attachment) => {
    await previous;
    await processAttachment(attachment);
  }, Promise.resolve());

  mappingsByResponse.forEach((mapping, responseId) => {
    zip.file(
      `${getResponseAttachmentFolderPath(responseId)}/${MAPPING_FILENAME}`,
      JSON.stringify(Object.fromEntries(mapping), null, 2)
    );
  });

  if (failures.length > 0 && options.writeFailureManifest !== false) {
    zip.file("attachment-download-errors.json", JSON.stringify(failures, null, 2));
  }

  return failures;
};
