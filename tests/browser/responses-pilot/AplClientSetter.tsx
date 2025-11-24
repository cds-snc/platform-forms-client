import { useEffect } from "react";
import { GCFormsApiClient } from "@responses-pilot/lib/apiClient";
import { useResponsesContext } from "@responses-pilot/context/ResponsesContext";

// Test helper that sets API client on mount
export function ApiClientSetter({ mockClient }: { mockClient: GCFormsApiClient }) {
  const { setApiClient } = useResponsesContext();

  useEffect(() => {
    setApiClient(mockClient);
  }, [mockClient, setApiClient]);

  return null;
}
