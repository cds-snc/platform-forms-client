import type JSZip from "jszip";
import { processSequentially } from "./processSequentially";
import { ResponseDownloadErrorCode, type ResponseAttachmentGroup } from "./types";

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
  code: ResponseDownloadErrorCode;
  responseId: string;
  filename: string;
  reason: string;
};

type ZipEntryData = string | Blob | Uint8Array | ArrayBuffer;

type AddResponseAttachmentsOptions = {
  onProgress?: (progress: AttachmentDownloadProgress) => void;
  refreshDownloadLink?: (responseId: string, attachmentId: string) => Promise<string | undefined>;
  writeFailureManifest?: boolean;
  addFileToZip?: (path: string, data: ZipEntryData) => boolean;
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
  let sizeLimitReached = false;
  let completed = 0;

  options.onProgress?.({ completed, total: attachments.length });

  const processAttachment = async ({ group, attachment, index }: (typeof attachments)[number]) => {
    if (sizeLimitReached) {
      failures.push({
        code: ResponseDownloadErrorCode.SIZE_LIMIT,
        responseId: group.responseId,
        filename: attachment.name,
        reason: "Archive size limit reached",
      });
      completed += 1;
      options.onProgress?.({ completed, total: attachments.length, filename: attachment.name });
      return;
    }

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
          code: ResponseDownloadErrorCode.PROCESSING,
          responseId: group.responseId,
          filename: attachment.name,
          reason: `HTTP ${response.status}`,
        });
      } else {
        const blob = await response.blob();
        const added = options.addFileToZip
          ? options.addFileToZip(path, blob)
          : (zip.file(path, blob), true);
        if (!added) {
          sizeLimitReached = true;
          failures.push({
            code: ResponseDownloadErrorCode.SIZE_LIMIT,
            responseId: group.responseId,
            filename: attachment.name,
            reason: "Archive size limit reached",
          });
        } else {
          const mapping = mappingsByResponse.get(group.responseId) ?? new Map();
          mapping.set(attachment.id, {
            originalName: attachment.name,
            actualName: path.split("/").pop() ?? attachment.name,
            isPotentiallyMalicious: attachment.isPotentiallyMalicious,
          });
          mappingsByResponse.set(group.responseId, mapping);
        }
      }
    } catch {
      failures.push({
        code: ResponseDownloadErrorCode.PROCESSING,
        responseId: group.responseId,
        filename: attachment.name,
        reason: "Download failed",
      });
    }

    completed += 1;
    options.onProgress?.({ completed, total: attachments.length, filename: attachment.name });
  };

  // Process one file at a time to limit in-flight memory and preserve earlier ZIP entries on failure.
  await processSequentially(attachments, processAttachment);

  mappingsByResponse.forEach((mapping, responseId) => {
    const path = `${getResponseAttachmentFolderPath(responseId)}/${MAPPING_FILENAME}`;
    const contents = JSON.stringify(Object.fromEntries(mapping), null, 2);
    const added = options.addFileToZip
      ? options.addFileToZip(path, contents)
      : (zip.file(path, contents), true);
    if (!added) {
      failures.push({
        code: ResponseDownloadErrorCode.SIZE_LIMIT,
        responseId,
        filename: MAPPING_FILENAME,
        reason: "Archive size limit reached",
      });
    }
  });

  if (failures.length > 0 && options.writeFailureManifest !== false) {
    zip.file("attachment-download-errors.json", JSON.stringify(failures, null, 2));
  }

  return failures;
};
