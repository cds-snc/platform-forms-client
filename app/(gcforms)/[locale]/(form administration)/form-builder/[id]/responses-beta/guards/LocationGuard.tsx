"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useResponsesContext } from "../context/ResponsesContext";
import { Spinner } from "@root/components/clientComponents/forms/SubmitProgress/Spinner";

export function LocationGuard({
  locale,
  id,
  children,
}: {
  locale: string;
  id: string;
  children: React.ReactNode;
}) {
  const { directoryHandle } = useResponsesContext();
  const router = useRouter();

  useEffect(() => {
    if (!directoryHandle) {
      router.replace(`/${locale}/form-builder/${id}/responses-beta/location`);
    }
  }, [directoryHandle, locale, id, router]);

  if (!directoryHandle) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
