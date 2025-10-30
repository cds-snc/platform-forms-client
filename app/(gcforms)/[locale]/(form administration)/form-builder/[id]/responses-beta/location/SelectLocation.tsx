"use client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { DirectoryPicker } from "./DirectoryPicker";
import { useCallback } from "react";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { initCsv } from "../lib/csvWriter";
import { LinkButton } from "@root/components/serverComponents/globals/Buttons/LinkButton";

export const SelectLocation = ({ locale, id }: { locale: string; id: string }) => {
  const { apiClient, directoryHandle, setDirectoryHandle, setCsvFileHandle } =
    useResponsesContext();

  const setDirectory = useCallback(
    async (handle: FileSystemDirectoryHandle | null) => {
      if (!handle) {
        return;
      }

      setDirectoryHandle(handle);

      const formId = apiClient?.getFormId();
      const formTemplate = await apiClient?.getFormTemplate();

      // Initialize CSV file as needed in the selected directory
      const csvFileHandle = await initCsv({ formId, dirHandle: handle, formTemplate });

      setCsvFileHandle(csvFileHandle ?? null);
    },
    [apiClient, setDirectoryHandle, setCsvFileHandle]
  );

  const handleCancel = () => {
    //
  };

  return (
    <div>
      <div>Step 2 of 3</div>
      <h1>Select Location</h1>

      {!directoryHandle && (
        <div className="mb-4">
          <DirectoryPicker onPick={setDirectory} />
        </div>
      )}
      {directoryHandle && <p className="mb-4">Save location selected successfully.</p>}

      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <LinkButton.Primary href={`/${locale}/form-builder/${id}/responses-beta/format`}>
          Next
        </LinkButton.Primary>
      </div>
    </div>
  );
};
