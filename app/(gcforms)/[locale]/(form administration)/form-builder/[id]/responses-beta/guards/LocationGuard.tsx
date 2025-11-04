"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResponsesContext } from "../context/ResponsesContext";
import { ContentPlaceholder } from "./ContentPlaceholder";

export function LocationGuard({ children }: { children: React.ReactNode }) {
  const { directoryHandle, locale, formId } = useResponsesContext();
  const router = useRouter();

  useEffect(() => {
    if (!directoryHandle) {
      router.replace(`/${locale}/form-builder/${formId}/responses-beta/location`);
    }
  }, [directoryHandle, locale, formId, router]);

  if (!directoryHandle) {
    return <ContentPlaceholder />;
  }

  return <>{children}</>;
}
