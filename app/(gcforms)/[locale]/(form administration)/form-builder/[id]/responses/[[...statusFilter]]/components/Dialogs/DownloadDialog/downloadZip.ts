/*--------------------------------------------*
 * Local Relative
 *--------------------------------------------*/
import type { GenerateDownloadZipOptions } from "./DownloadDialog.types";

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

export const generateDownloadZip = async ({
  zip,
  fileName,
  setDownloadProgress,
}: GenerateDownloadZipOptions): Promise<void> => {
  setDownloadProgress({ phase: "zip", percent: 0 });
  const blob = await zip.generateAsync({ type: "blob", streamFiles: true }, ({ percent }) =>
    setDownloadProgress({ phase: "zip", percent })
  );
  downloadFileFromBlob(blob, fileName);
};
