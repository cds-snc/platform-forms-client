/*--------------------------------------------*
 * Framework and Third-Party
 *--------------------------------------------*/
import JSZip from "jszip";

/*--------------------------------------------*
 * Internal Aliases
 *--------------------------------------------*/
import { logMessage } from "@lib/logger";

/*--------------------------------------------*
 * Local Relative
 *--------------------------------------------*/
import type {
  DownloadFailure,
  DownloadProgress,
  GenerateDownloadZipOptions,
  RecoveryFile,
} from "./DownloadDialog.types";

export const getVersionedZipFileName = (baseFileName: string, version: string | null) => {
  if (!version) return baseFileName;

  const normalizedVersion = version.trim().replace(/^v/i, "");
  return baseFileName.replace(/\.zip$/, `-v${normalizedVersion}.zip`);
};

export const downloadFileFromBlob = (data: Blob, fileName: string) => {
  const href = window.URL.createObjectURL(data);
  const anchorElement = document.createElement("a");
  anchorElement.href = href;
  anchorElement.download = fileName;
  document.body.appendChild(anchorElement);
  anchorElement.click();
  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(href);
};

export const createRecoveryCopy = async (
  files: RecoveryFile[],
  downloadFailures: DownloadFailure[],
  formId: string,
  setDownloadProgress: (progress: DownloadProgress) => void
) => {
  setDownloadProgress({ phase: "recovery" });
  try {
    const recoveryZip = new JSZip();
    files.forEach(({ path, data }) => recoveryZip.file(path, data));
    if (downloadFailures.length > 0) {
      recoveryZip.file("response-download-errors.json", JSON.stringify(downloadFailures, null, 2));
    }
    recoveryZip.file(
      "RECOVERY-COPY-NOTE.txt",
      "This recovery copy contains response files but may be missing attachments. The complete ZIP could not be created."
    );
    return await recoveryZip.generateAsync({ type: "blob", streamFiles: true });
  } catch (err) {
    logMessage.warn(
      `Response ZIP recovery copy could not be created for form ${formId}: ${(err as Error).message}`
    );
    return undefined;
  }
};

export const generateDownloadZip = async ({
  zip,
  recoveryCopy,
  fileName,
  formId,
  setDownloadProgress,
}: GenerateDownloadZipOptions) => {
  try {
    setDownloadProgress({ phase: "zip", percent: 0 });
    const blob = await zip.generateAsync({ type: "blob", streamFiles: true }, ({ percent }) =>
      setDownloadProgress({ phase: "zip", percent })
    );
    logMessage.debug({
      message: "Response ZIP generation complete",
      formId,
      zipSizeBytes: blob.size,
    });
    downloadFileFromBlob(blob, fileName);
  } catch (err) {
    if (!recoveryCopy) throw err;
    logMessage.error(err as Error);
    logMessage.warn(`Downloading response ZIP recovery copy for form ${formId}`);
    downloadFileFromBlob(recoveryCopy, fileName);
  }
};
