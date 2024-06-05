import { logMessage } from "@lib/logger";

export const clearTemplateStore = () => {
  if (typeof window === "undefined") return;

  sessionStorage.removeItem("form-storage");
};

export const clearTemplateStorage = (id: string) => {
  if (typeof window === "undefined") return;

  const formStorage = sessionStorage.getItem("form-storage");

  if (!formStorage) return;

  const storage = JSON.parse(formStorage);

  if (storage && storage.state.id !== id) {
    sessionStorage.removeItem("form-storage");
    logMessage.debug(`Cleared form-storage: ${id}, ${storage.state.id}`);
    return;
  }

  logMessage.debug(`Keep form-storage: ${id}, ${storage.state.id}`);
};
