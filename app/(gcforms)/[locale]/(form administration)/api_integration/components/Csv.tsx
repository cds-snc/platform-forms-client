import { useCallback } from "react";

import { useState } from "react";
import { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { type IGCFormsApiClient } from "../lib/IGCFormsApiClient";

import { Button } from "@clientComponents/globals";

import { ContentWrapper } from "./ContentWrapper";
import { showDirectoryPicker } from "native-file-system-adapter";
import { jsonFilesToCsv } from "../lib/jsonFilesToCsv";

export const Csv = ({ apiClient }: { apiClient: IGCFormsApiClient | null }) => {
  const [directoryHandle, setDirectoryHandle] = useState<FileSystemDirectoryHandle | null>(null);
  const [hasDirectory, setHasDirectory] = useState(false);

  const toCsv = useCallback(async () => {
    const formTemplate = await apiClient?.getFormTemplate();
    const formId = apiClient?.getFormId() || "<formId>";

    if (formTemplate) {
      await jsonFilesToCsv({
        formId,
        directoryHandle: directoryHandle,
        formTemplate,
      });
    }
  }, [apiClient, directoryHandle]);

  if (!apiClient) {
    return null;
  }

  return (
    <ContentWrapper>
      <div>
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

        {hasDirectory && <Button onClick={toCsv}>Generate CSV</Button>}
      </div>
    </ContentWrapper>
  );
};
