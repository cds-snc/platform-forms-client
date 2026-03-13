"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { EditLockBanner } from "./EditLockBanner";

const isEditPath = (pathname: string | null) => {
  if (!pathname) return false;
  return (
    pathname.includes("/form-builder/") &&
    (pathname.includes("/edit") || pathname.includes("/translate") || pathname.includes("/preview"))
  );
};

const makeSessionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const EditLockClient = ({ formId }: { formId: string }) => {
  const pathname = usePathname();
  const enabled = isEditPath(pathname) && formId !== "0000";
  const [sessionId] = useState(() => makeSessionId());

  const { takeover } = useEditLock({ formId, enabled, sessionId });

  if (!enabled) return null;

  return <EditLockBanner takeover={takeover} />;
};
