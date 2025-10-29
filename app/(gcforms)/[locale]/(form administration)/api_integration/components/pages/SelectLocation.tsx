import { Button } from "@clientComponents/globals";
import { useStepFlow } from "../../contexts/ApiResponseDownloaderContext";
import { DirectoryPicker } from "../DirectoryPicker";
import { useCallback } from "react";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";
import { initCsv } from "../../lib/csvWriter";

export const SelectLocation = () => {
  const { onNext, onCancel, apiClient, directoryHandle, setDirectoryHandle, setCsvFileHandle } =
    useStepFlow();

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
        <Button theme="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!directoryHandle} theme="primary" onClick={onNext}>
          Next
        </Button>
      </div>
    </div>
  );
};
