// ──────────────────────────────
// 📦 External Packages & APIs
// ──────────────────────────────
import { useState, useCallback } from "react";
import { showOpenFilePicker } from "native-file-system-adapter";

// ──────────────────────────────
// 🏠 Internal Types & Modules
// ──────────────────────────────
import type { PrivateApiKey } from "../lib/types";
import { getAccessTokenFromApiKey } from "../lib/utils";
import { GCFormsApiClient } from "../lib/apiClient";
import { MockGCFormsApiClient } from "../lib/mockApiClient";

// ──────────────────────────────
// ⚠️  - set to false to use the real API
const MOCK_API_CLIENT = process.env.NODE_ENV === "development";
// ──────────────────────────────

export const useGetClient = () => {
  const [isCompatible] = useState(
    () => typeof window !== "undefined" && "showOpenFilePicker" in window
  );

  const [userKey, setUserKey] = useState<PrivateApiKey | null>(null);
  const [apiClient, setApiClient] = useState<GCFormsApiClient | MockGCFormsApiClient | null>(null);

  const handleLoadApiKey = useCallback(async () => {
    try {
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

      if (!token) {
        return false;
      }

      setApiClient(
        MOCK_API_CLIENT
          ? new MockGCFormsApiClient(keyFile.formId, process.env.NEXT_PUBLIC_API_URL ?? "", token)
          : new GCFormsApiClient(keyFile.formId, process.env.NEXT_PUBLIC_API_URL ?? "", token)
      );

      setUserKey(keyFile);

      return true;
    } catch (error) {
      // no-op
      return false;
    }
  }, []);

  return { isCompatible, handleLoadApiKey, userKey, apiClient };
};
