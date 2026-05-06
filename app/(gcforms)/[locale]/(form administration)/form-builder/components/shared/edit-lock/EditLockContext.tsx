"use client";

import { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const isEditPath = (pathname: string | null) => {
  if (!pathname) return false;
  return (
    pathname.includes("/form-builder/") &&
    (pathname.includes("/edit") ||
      pathname.includes("/translate") ||
      pathname.includes("/preview") ||
      pathname.includes("/publish") ||
      pathname.includes("/published"))
  );
};

export const isSettingsPath = (pathname: string | null) => {
  if (!pathname) return false;
  return pathname.includes("/form-builder/") && pathname.includes("/settings");
};

const makeSessionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

interface EditLockContextValue {
  takeover: () => Promise<void>;
  getIsActiveTab: () => boolean;
  hasSessionExpired: boolean;
  isEnabled: boolean;
}

const EditLockContext = createContext<EditLockContextValue | null>(null);

export const EditLockProvider = ({
  formId,
  lockedEditingEnabled = true,
  ownerIdleTimeoutMs,
  children,
}: {
  formId: string;
  lockedEditingEnabled?: boolean;
  ownerIdleTimeoutMs?: number;
  children: React.ReactNode;
}) => {
  "use memo";
  const pathname = usePathname();
  const { currentFormId } = useTemplateStore((s) => ({ currentFormId: s.id }));
  const activeFormId = currentFormId || formId;
  const [sessionId] = useState(() => makeSessionId());

  const enabled =
    lockedEditingEnabled &&
    process.env.NEXT_PUBLIC_APP_ENV !== "test" &&
    (isEditPath(pathname) || isSettingsPath(pathname)) &&
    activeFormId !== "0000";

  const { takeover, getIsActiveTab, hasSessionExpired } = useEditLock({
    formId: activeFormId,
    enabled,
    sessionId,
    ownerIdleTimeoutMs,
  });

  return (
    <EditLockContext.Provider
      value={{ takeover, getIsActiveTab, hasSessionExpired, isEnabled: enabled }}
    >
      {children}
    </EditLockContext.Provider>
  );
};

export const useEditLockContext = () => {
  const context = useContext(EditLockContext);
  if (context === null) {
    throw new Error(
      "useEditLockContext must be used within EditLockProvider. Wrap the calling component in EditLockProvider."
    );
  }
  return context;
};
