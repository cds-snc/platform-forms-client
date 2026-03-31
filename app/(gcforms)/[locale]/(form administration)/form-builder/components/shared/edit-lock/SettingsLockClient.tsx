"use client";

import { useCallback, useState } from "react";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { EditLockBanner } from "./EditLockBanner";

const makeSessionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const SettingsLockClient = ({
  formId,
  children,
}: {
  formId: string;
  children: React.ReactNode;
}) => {
  const enabled = process.env.NEXT_PUBLIC_APP_ENV !== "test" && formId !== "0000";
  const [sessionId] = useState(() => makeSessionId());

  const { takeover } = useEditLock({ formId, enabled, sessionId });
  const handleTakeover = useCallback(async () => {
    await takeover();
    window.location.reload();
  }, [takeover]);

  return (
    <>
      {enabled && <EditLockBanner takeover={handleTakeover} />}
      <div>{children}</div>
    </>
  );
};
