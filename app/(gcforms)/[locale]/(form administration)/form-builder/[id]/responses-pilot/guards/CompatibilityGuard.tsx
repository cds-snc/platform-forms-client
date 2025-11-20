"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResponsesContext } from "../context/ResponsesContext";

export function CompatibilityGuard({ children }: { children: React.ReactNode }) {
  const { isCompatible, locale, formId } = useResponsesContext();
  const router = useRouter();

  useEffect(() => {
    if (!isCompatible) {
      router.replace(`/${locale}/form-builder/${formId}/responses-pilot/not-supported`);
    }
  }, [isCompatible, locale, formId, router]);

  // Allow rendering children while redirecting - avoids flash of not-supported content
  return <>{children}</>;
}
