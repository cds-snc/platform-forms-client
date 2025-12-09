import { useEffect } from "react";
import { useResponsesContext } from "@responses-pilot/context/ResponsesContext";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

interface ContextSettersProps {
  directoryHandle?: FileSystemDirectoryHandle | { name: string };
  processedSubmissionIds?: Set<string>;
  hasError?: boolean;
  hasMaliciousAttachments?: boolean;
}

// Test helper that sets multiple context values on mount
export function ContextSetters({
  directoryHandle,
  processedSubmissionIds,
  hasError,
  hasMaliciousAttachments,
}: ContextSettersProps) {
  const { setDirectoryHandle, setProcessedSubmissionIds, setHasError, setHasMaliciousAttachments } =
    useResponsesContext();

  useEffect(() => {
    if (directoryHandle) {
      setDirectoryHandle(directoryHandle as FileSystemDirectoryHandle);
    }
    if (processedSubmissionIds) {
      setProcessedSubmissionIds(processedSubmissionIds);
    }
    if (hasError !== undefined) {
      setHasError(hasError);
    }
    if (hasMaliciousAttachments !== undefined) {
      setHasMaliciousAttachments(hasMaliciousAttachments);
    }
  }, [
    directoryHandle,
    processedSubmissionIds,
    hasError,
    hasMaliciousAttachments,
    setDirectoryHandle,
    setProcessedSubmissionIds,
    setHasError,
    setHasMaliciousAttachments,
  ]);

  return null;
}
