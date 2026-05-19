"use client";

import { usePathname } from "next/navigation";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { EditLockBanner } from "@formBuilder/components/shared/edit-lock/EditLockBanner";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/headless-treeview/provider/TreeRefProvider";
import { EditLockSessionExpiredOverlay } from "./EditLockSessionExpiredOverlay";
import { useEditLockContext, isEditPath } from "./EditLockContext";

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
  const { isPublished } = useTemplateStore((s) => ({
    isPublished: s.isPublished,
  }));
  const { takeover, getIsActiveTab, hasSessionExpired, isEnabled } = useEditLockContext();
  const { headlessTree } = useTreeRef();

  const showLockedEdit =
    isEnabled && !isPublished && (!restrictToEditPaths || isEditPath(pathname));

  const handleTakeover = async () => {
    await takeover();
    headlessTree?.current?.rebuildTree();

    if (reloadOnTakeover) {
      window.location.reload();
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
