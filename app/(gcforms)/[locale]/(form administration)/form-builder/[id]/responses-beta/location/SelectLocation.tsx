"use client";

import { Button } from "@clientComponents/globals";
import { useResponsesContext } from "../context/ResponsesContext";
import { DirectoryPicker } from "./DirectoryPicker";
import { useCallback } from "react";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { initCsv } from "../lib/csvWriter";
import { useRouter } from "next/navigation";

export const SelectLocation = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

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

  const handleNext = () => {
    router.push(`/${locale}/form-builder/${id}/responses-beta/format`);
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
      {directoryHandle && (
        <p className="mb-4">
          Save location selected successfully:{" "}
          <span className="rounded border border-violet-500 bg-violet-100 px-1">
            {directoryHandle.name}
          </span>
        </p>
      )}

      <div className="flex flex-row gap-4">
        <Button theme="secondary" onClick={handleCancel}>
          Cancel
        </Button>
        <Button theme="primary" disabled={!directoryHandle} onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
