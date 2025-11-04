"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResponsesContext } from "../context/ResponsesContext";

export function CompatibilityGuard({
  locale,
  id,
  children,
}: {
  locale: string;
  id: string;
  children: React.ReactNode;
}) {
  const { isCompatible } = useResponsesContext();
  const router = useRouter();

  useEffect(() => {
    if (!isCompatible) {
      router.replace(`/${locale}/form-builder/${id}/responses-beta/not-supported`);
    }
  }, [isCompatible, locale, id, router]);

  // Allow rendering children while redirecting - avoids flash of not-supported content
  return <>{children}</>;
}
