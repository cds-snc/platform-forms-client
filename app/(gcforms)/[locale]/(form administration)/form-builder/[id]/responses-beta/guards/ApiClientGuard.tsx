"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResponsesContext } from "../context/ResponsesContext";
import { ContentPlaceholder } from "./ContentPlaceholder";

export function ApiClientGuard({ children }: { children: React.ReactNode }) {
  const { apiClient, locale, formId } = useResponsesContext();
  const router = useRouter();

  useEffect(() => {
    if (!apiClient) {
      router.replace(`/${locale}/form-builder/${formId}/responses-beta/load-key`);
    }
  }, [apiClient, locale, formId, router]);

  if (!apiClient) {
    return <ContentPlaceholder />;
  }

  return <>{children}</>;
}
