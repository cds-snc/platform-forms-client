"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { useTemplateStore } from "@lib/store/useTemplateStore";
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
  const currentFormId = useTemplateStore((s) => s.id);
  const activeFormId = currentFormId || formId;
  const enabled =
    process.env.NEXT_PUBLIC_APP_ENV !== "test" && isEditPath(pathname) && activeFormId !== "0000";
  const [sessionId] = useState(() => makeSessionId());

  const { takeover } = useEditLock({ formId: activeFormId, enabled, sessionId });

  if (!enabled) return null;

  return <EditLockBanner takeover={takeover} />;
};
