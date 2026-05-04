"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { EditLockBanner } from "@formBuilder/components/shared/edit-lock/EditLockBanner";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";
import { EditLockSessionExpiredOverlay } from "./EditLockSessionExpiredOverlay";
import { useRouter } from "next/navigation";

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

export const EditLockClient = ({
  formId,
  lockedEditingEnabled = true,
  ownerIdleTimeoutMs,
  children,
  restrictToEditPaths = true,
  reloadOnTakeover = false,
}: {
  formId: string;
  lockedEditingEnabled?: boolean;
  ownerIdleTimeoutMs?: number;
  children?: React.ReactNode;
  restrictToEditPaths?: boolean;
  reloadOnTakeover?: boolean;
}) => {
  "use memo";
  const pathname = usePathname();
  const router = useRouter();
  const { currentFormId, language } = useTemplateStore((s) => ({
    currentFormId: s.id,
    isLockedByOther: s.isLockedByOther,
    language: s.lang,
  }));
  const activeFormId = currentFormId || formId;
  const enabled =
    lockedEditingEnabled &&
    process.env.NEXT_PUBLIC_APP_ENV !== "test" &&
    (!restrictToEditPaths || isEditPath(pathname)) &&
    activeFormId !== "0000";
  const [sessionId] = useState(() => makeSessionId());

  const { takeover, getIsActiveTab, hasSessionExpired } = useEditLock({
    formId: activeFormId,
    enabled,
    sessionId,
    ownerIdleTimeoutMs,
  });

  const { headlessTree } = useTreeRef();

  const handleTakeover = async () => {
    await takeover();
    headlessTree?.current?.rebuildTree();

    if (reloadOnTakeover) {
      window.location.reload();
    }
  };

  if (!enabled) {
    return children ? <>{children}</> : null;
  }

  // Show the session expired overlay only for the previous owner
  const showSessionExpiredOverlay = hasSessionExpired;

  const returnToForms = () => {
    router.push(`/${language}/forms`);
  };

  return (
    <>
      {showSessionExpiredOverlay ? (
        <EditLockSessionExpiredOverlay onReturnToForms={returnToForms} />
      ) : (
        <EditLockBanner takeover={handleTakeover} getIsActiveTab={getIsActiveTab} />
      )}
      {children}
    </>
  );
};
