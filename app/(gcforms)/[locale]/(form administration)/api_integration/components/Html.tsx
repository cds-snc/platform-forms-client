import { useCallback } from "react";

import { useState } from "react";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { type IGCFormsApiClient } from "../lib/IGCFormsApiClient";

import { Button } from "@clientComponents/globals";

import { ContentWrapper } from "./ContentWrapper";
import { showDirectoryPicker } from "native-file-system-adapter";
import { jsonFilesToHtml } from "../lib/jsonFilesToHtml";
import { useTranslation } from "@root/i18n/client";

export const Html = ({ apiClient }: { apiClient: IGCFormsApiClient | null }) => {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [hasDirectory, setHasDirectory] = useState(false);

  const { t } = useTranslation("my-forms");

  const toHtml = useCallback(async () => {
    const formTemplate = await apiClient?.getFormTemplate();
    const formId = apiClient?.getFormId() || "<formId>";

    if (formTemplate) {
      await jsonFilesToHtml({
        formId,
        directoryHandle: directoryHandle,
        formTemplate,
        t,
      });
    }
  }, [apiClient, directoryHandle, t]);

  if (!apiClient) {
    return null;
  }

  return (
    <ContentWrapper>
      <div>
        <h2>Generate HTML from files</h2>
        {!hasDirectory && (
          <Button
            onClick={async () => {
              try {
                const dirHandle = await showDirectoryPicker();
                setDirectoryHandle(dirHandle as FileSystemDirectoryHandle | null);
                setHasDirectory(true);
              } catch (error) {
                if ((error as Error).name === "AbortError") return;
              }
            }}
          >
            Choose Save Location
          </Button>
        )}

        {hasDirectory && <Button onClick={toHtml}>Generate HTML</Button>}
      </div>
    </ContentWrapper>
  );
};
