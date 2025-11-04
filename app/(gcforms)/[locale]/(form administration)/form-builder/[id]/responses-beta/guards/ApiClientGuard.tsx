"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResponsesContext } from "../context/ResponsesContext";
import { Spinner } from "@root/components/clientComponents/forms/SubmitProgress/Spinner";

export function ApiClientGuard({
  locale,
  id,
  children,
}: {
  locale: string;
  id: string;
  children: React.ReactNode;
}) {
  const { apiClient } = useResponsesContext();
  const router = useRouter();

  useEffect(() => {
    if (!apiClient) {
      router.replace(`/${locale}/form-builder/${id}/responses-beta/load-key`);
    }
  }, [apiClient, locale, id, router]);

  if (!apiClient) {
    return <Spinner />;
  }

  return <>{children}</>;
}
