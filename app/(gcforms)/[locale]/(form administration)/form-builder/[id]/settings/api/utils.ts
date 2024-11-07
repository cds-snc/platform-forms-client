import { createServiceAccountKey, refreshServiceAccountKey } from "./actions";
import JSZip from "jszip";

import { getReadmeContent } from "./actions";

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

export const _refreshKey = async (templateId: string) => {
  const key = await refreshServiceAccountKey(templateId);
  return key;
};

export const downloadKey = async (key: string, templateId: string) => {
  const zip = new JSZip();

  // Add Readme.md
  const result = await getReadmeContent();

  if (result.error) {
    throw new Error("Error fetching Readme.md");
  }

  zip.file("Readme.md", result.content || "");

  // Add key
  const keyBlob = new Blob([key], { type: "application/json" });
  zip.file(`${templateId}_private_api_key.json`, keyBlob);

  // Generate zip
  zip.generateAsync({ type: "nodebuffer", streamFiles: true }).then((buffer) => {
    const fileName = `${templateId}_api.zip`;
    downloadFileFromBlob(new Blob([buffer]), fileName);
  });
};
