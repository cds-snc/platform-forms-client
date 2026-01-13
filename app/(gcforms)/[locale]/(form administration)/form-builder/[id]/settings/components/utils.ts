import { createServiceAccountKey, refreshServiceAccountKey } from "../actions";

const downloadFileFromBlob = (data: Blob, fileName: string) => {
  const href = window.URL.createObjectURL(data);
  const anchorElement = document.createElement("a");
  anchorElement.href = href;
  anchorElement.download = fileName;
  document.body.appendChild(anchorElement);
  anchorElement.click();
  document.body.removeChild(anchorElement);
  window.URL.revokeObjectURL(href);
};

export const _createKey = async (templateId: string) => {
  const key = await createServiceAccountKey(templateId);
  return key;
};

export const _regenKey = async (templateId: string) => {
  const key = await refreshServiceAccountKey(templateId);
  return key;
};

export const downloadKey = async (key: string, templateId: string) => {
  // Download the key JSON directly
  const keyBlob = new Blob([key], { type: "application/json" });
  const fileName = `${templateId}_private_api_key.json`;
  downloadFileFromBlob(keyBlob, fileName);
};
