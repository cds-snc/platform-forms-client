"use client";

import { useState } from "react";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { useIsAdminUser } from "@lib/hooks/form-builder/useIsAdminUser";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { EditLockBanner } from "@formBuilder/[id]/components/EditLockBanner";

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
  const enabled = formId !== "0000";
  const [sessionId] = useState(() => makeSessionId());
  const canTakeover = useIsAdminUser();
  const isLockedByOther = useTemplateStore((s) => s.isLockedByOther);

  const { takeover } = useEditLock({ formId, enabled, sessionId });

  return (
    <>
      {enabled && <EditLockBanner canTakeover={canTakeover} takeover={takeover} />}
      <div className={isLockedByOther ? "pointer-events-none opacity-70" : undefined}>
        {children}
      </div>
    </>
  );
};
