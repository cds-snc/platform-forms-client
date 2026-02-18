import { useEffect } from "react";
import { useResponsesContext } from "@responses-pilot/context/ResponsesContext";

// Test helper that sets currentSubmissionId on mount
export function CurrentSubmissionIdSetter({ submissionId }: { submissionId: string }) {
  const { setCurrentSubmissionId } = useResponsesContext();

  useEffect(() => {
    setCurrentSubmissionId(submissionId);
  }, [submissionId, setCurrentSubmissionId]);

  return null;
}
