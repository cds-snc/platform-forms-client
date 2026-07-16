"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { EditLockBanner } from "@formBuilder/components/shared/edit-lock/EditLockBanner";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";
import { EditLockSessionExpiredOverlay } from "./EditLockSessionExpiredOverlay";
import { useEditLockContext, isEditPath } from "./EditLockContext";
import { toast } from "@formBuilder/components/shared/Toast";

export const EditLockClient = ({
  children,
  restrictToEditPaths = true,
  reloadOnTakeover = false,
  formId,
}: {
  children?: React.ReactNode;
  restrictToEditPaths?: boolean;
  reloadOnTakeover?: boolean;
  formId: string;
}) => {
  const pathname = usePathname();
  const { t } = useTranslation("form-builder");
  const { isPublished, currentDraftVersionId } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
    currentDraftVersionId: s.currentDraftVersionId,
  }));
  const { takeover, getIsActiveTab, hasSessionExpired, isEnabled } = useEditLockContext();
  const { headlessTree } = useTreeRef();

  // Show takeover toast - Step 2: for pages that reload, show toast after reload
  const toastString = t("editLock.syncedLatest");
  useEffect(() => {
    try {
      const toastKey = sessionStorage.getItem("showToast");
      if (toastKey === "editLockTakeoverSuccess") {
        toast.success(toastString, "wide");
        sessionStorage.removeItem("showToast");
      }
    } catch {
      // Fail closed if storage is unavailable (e.g. blocked or sandboxed context)
    }
  }, [toastString]);

  const showLockedEdit =
    isEnabled &&
    (!isPublished || currentDraftVersionId) &&
    (!restrictToEditPaths || isEditPath(pathname));

  const handleTakeover = async () => {
    await takeover();
    headlessTree?.current?.rebuildTree();

    if (reloadOnTakeover) {
      sessionStorage.setItem("showToast", "editLockTakeoverSuccess");
      window.location.reload();
    } else {
      // Show takeover toast immediately when no page reload will occur
      toast.success(t("editLock.syncedLatest"), "wide");
    }
  };

  if (!showLockedEdit) {
    return children ? <>{children}</> : null;
  }

  // Show the session expired overlay only for the previous owner
  const showSessionExpiredOverlay = hasSessionExpired;

  const reloadPage = () => {
    window.location.reload();
  };

  return (
    <>
      {showSessionExpiredOverlay ? (
        <EditLockSessionExpiredOverlay onReloadPage={reloadPage} formId={formId} />
      ) : (
        <EditLockBanner takeover={handleTakeover} getIsActiveTab={getIsActiveTab} formId={formId} />
      )}
      {children}
    </>
  );
};
