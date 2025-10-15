/* eslint-disable no-await-in-loop */
import { useCallback } from "react";

import { useState } from "react";
import { type IGCFormsApiClient } from "../lib/IGCFormsApiClient";

import { Button } from "@clientComponents/globals";

import { ContentWrapper } from "./ContentWrapper";
import { DirectoryPicker } from "./DirectoryPicker";
import { processJsonToCsv } from "../lib/jsonToCsv";

export const Csv = ({ apiClient }: { apiClient: IGCFormsApiClient | null }) => {
  const [directoryHandle, setDirectoryHandle] = useState<unknown>(null);

  const toCsv = useCallback(async () => {
    const allJsonFiles = ["15-10-1be8e.json", "15-10-8c05c.json", "15-10-e604f.json"];

    const formTemplate = await apiClient?.getFormTemplate();

    if (formTemplate) {
      await processJsonToCsv({
        formId: apiClient?.getFormId() || "<formId>",
        jsonFileNames: allJsonFiles,
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
