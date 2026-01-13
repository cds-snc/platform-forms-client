import { useEffect } from "react";
import { useResponsesContext } from "@responses-pilot/context/ResponsesContext";
import type { FileSystemDirectoryHandle } from "native-file-system-adapter";

interface ContextSettersProps {
  directoryHandle?: FileSystemDirectoryHandle | { name: string };
  processedSubmissionsCount?: number;
  hasError?: boolean;
  hasMaliciousAttachments?: boolean;
}

// Test helper that sets multiple context values on mount
export function ContextSetters({
  directoryHandle,
  processedSubmissionsCount,
  hasError,
  hasMaliciousAttachments,
}: ContextSettersProps): null {
  const {
    setDirectoryHandle,
    setHasError,
    setHasMaliciousAttachments,
    setProcessedSubmissionsCount,
  } = useResponsesContext();

  useEffect(() => {
    if (directoryHandle) {
      setDirectoryHandle(directoryHandle as FileSystemDirectoryHandle);
    }
    if (processedSubmissionsCount !== undefined) {
      setProcessedSubmissionsCount(processedSubmissionsCount);
    }
    if (hasError !== undefined) {
      setHasError(hasError);
    }
    if (hasMaliciousAttachments !== undefined) {
      setHasMaliciousAttachments(hasMaliciousAttachments);
    }
  }, [
    directoryHandle,
    processedSubmissionsCount,
    hasError,
    hasMaliciousAttachments,
    setDirectoryHandle,
    setProcessedSubmissionsCount,
    setHasError,
    setHasMaliciousAttachments,
  ]);

  return null;
}
