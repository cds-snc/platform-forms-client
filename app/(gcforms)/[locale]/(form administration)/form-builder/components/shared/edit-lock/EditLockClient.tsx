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
  children,
  restrictToEditPaths = true,
  reloadOnTakeover = false,
}: {
  formId: string;
  lockedEditingEnabled?: boolean;
  children?: React.ReactNode;
  restrictToEditPaths?: boolean;
  reloadOnTakeover?: boolean;
}) => {
  "use memo";
  const pathname = usePathname();
  const router = useRouter();
  const { currentFormId, isLockedByOther, language } = useTemplateStore((s) => ({
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

  const { takeover, getIsActiveTab, isOwnerIdleTimeExpired } = useEditLock({
    formId: activeFormId,
    enabled,
    sessionId,
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

  const showSessionExpiredOverlay = isOwnerIdleTimeExpired && !isLockedByOther;

console.log("isOwnerIdleTimeExpired", isOwnerIdleTimeExpired, "isLockedByOther", isLockedByOther, "showSessionExpiredOverlay", showSessionExpiredOverlay);

  const returnToForms = () => {
    router.push(`/${language}/forms`);
  };

  return (
    <>
      {showSessionExpiredOverlay && (
        <EditLockSessionExpiredOverlay onReturnToForms={returnToForms} />
      )}
      <EditLockBanner takeover={handleTakeover} getIsActiveTab={getIsActiveTab} />
      {children}
    </>
  );
};
