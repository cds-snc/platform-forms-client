import { useEffect } from "react";
import { useResponsesContext } from "@responses-pilot/context/ResponsesContext";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

interface ContextSettersProps {
  directoryHandle?: FileSystemDirectoryHandle | { name: string };
  processedSubmissionIds?: Set<string>;
  hasError?: boolean;
}

// Test helper that sets multiple context values on mount
export function ContextSetters({
  directoryHandle,
  processedSubmissionIds,
  hasError,
}: ContextSettersProps) {
  const context = useResponsesContext();

  useEffect(() => {
    if (directoryHandle) {
      context.setDirectoryHandle(directoryHandle as FileSystemDirectoryHandle);
    }
    if (processedSubmissionIds) {
      context.setProcessedSubmissionIds(processedSubmissionIds);
    }
    if (hasError !== undefined) {
      context.setHasError(hasError);
    }
  }, [directoryHandle, processedSubmissionIds, hasError, context]);

  return null;
}
