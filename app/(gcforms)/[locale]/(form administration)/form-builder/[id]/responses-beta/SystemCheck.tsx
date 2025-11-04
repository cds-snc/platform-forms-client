"use client";

import { useRouter } from "next/navigation";
import { useResponsesContext } from "./context/ResponsesContext";

export const SystemCheck = ({ locale, id }: { locale: string; id: string }) => {
  const router = useRouter();

  const { isCompatible } = useResponsesContext();

  if (!isCompatible) {
    router.push(`/${locale}/form-builder/${id}/responses-beta/not-supported`);
    return null;
  }

  return null;
};
