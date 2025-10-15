import { useCallback } from "react";

import { useState } from "react";
import { type IGCFormsApiClient } from "../lib/IGCFormsApiClient";

import { Button } from "@clientComponents/globals";

import { ContentWrapper } from "./ContentWrapper";
import { DirectoryPicker } from "./DirectoryPicker";
import { jsonFilesToCsv } from "../lib/jsonFilesToCsv";

export const Csv = ({ apiClient }: { apiClient: IGCFormsApiClient | null }) => {
  const [directoryHandle, setDirectoryHandle] = useState<unknown>(null);

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
        <DirectoryPicker
          directoryHandle={directoryHandle}
          onPick={(handle) => {
            setDirectoryHandle(handle);
          }}
        />

        <Button onClick={toCsv} disabled={!directoryHandle} className="mt-4">
          Download CSV
        </Button>
      </div>
    </ContentWrapper>
  );
};
