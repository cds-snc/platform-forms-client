"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResponsesContext } from "../context/ResponsesContext";
import { ContentPlaceholder } from "./ContentPlaceholder";

export function FormatGuard({ children }: { children: React.ReactNode }) {
  const { selectedFormat, locale, formId } = useResponsesContext();
  const router = useRouter();

  useEffect(() => {
    if (!selectedFormat) {
      router.replace(`/${locale}/form-builder/${formId}/responses-pilot/format`);
    }
  }, [selectedFormat, locale, formId, router]);

  if (!selectedFormat) {
    return <ContentPlaceholder />;
  }

  return <>{children}</>;
}
