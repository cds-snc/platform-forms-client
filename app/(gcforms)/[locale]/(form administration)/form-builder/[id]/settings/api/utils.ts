import { createServiceAccountKey, refreshServiceAccountKey } from "./actions";

export const _createKey = async (templateId: string) => {
  const key = await createServiceAccountKey(templateId);
  return key;
};

export const _refreshKey = async (templateId: string) => {
  const key = await refreshServiceAccountKey(templateId);
  return key;
};

export const downloadKey = (key: string, templateId: string) => {
  const blob = new Blob([key], { type: "application/json" });
  const href = URL.createObjectURL(blob);

  // create "a" HTLM element with href to file
  const link = document.createElement("a");
  link.href = href;
  link.download = `${templateId}_private_api_key.json`;
  document.body.appendChild(link);
  link.click();

  // clean up "a" element & remove ObjectURL
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};
