// ──────────────────────────────
// 📦 External Packages & APIs
// ──────────────────────────────
import { useState, useCallback } from "react"; // React core hooks
import { showOpenFilePicker } from "native-file-system-adapter"; // Browser FS polyfill

// ──────────────────────────────
// 🏠 Internal Types & Modules
// ──────────────────────────────
import type { PrivateApiKey } from "../lib/types"; // Project-specific types
import { getAccessTokenFromApiKey } from "../lib/utils"; // Utility functions
import { GCFormsApiClient } from "../lib/apiClient"; // API client class

export const useGetClient = () => {
  const [isCompatible] = useState(
    () => typeof window !== "undefined" && "showOpenFilePicker" in window
  );
  const [userKey, setUserKey] = useState<PrivateApiKey | null>(null);
  const [apiClient, setApiClient] = useState<GCFormsApiClient | null>(null);

  const handleLoadApiKey = useCallback(async () => {
    // Simulate user key retrieval
    const [fileHandle] = await showOpenFilePicker({
      multiple: false, // default
      excludeAcceptAllOption: false, // default
      _preferPolyfill: false, // default
    });
    const keyFile = await fileHandle.getFile().then(async (file) => {
      const text = await file.text();
      return JSON.parse(text);
    });
    const token = await getAccessTokenFromApiKey(keyFile);
    if (token) {
      setApiClient(
        new GCFormsApiClient(keyFile.formId, process.env.NEXT_PUBLIC_API_URL ?? "", token)
      );
      setUserKey(keyFile);
    } else {
      alert("Failed to import private key.");
    }
  }, []);

  return { isCompatible, handleLoadApiKey, userKey, apiClient };
};
