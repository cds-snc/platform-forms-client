"use client";

import { usePathname, useRouter } from "next/navigation";
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
  refreshServerData = false,
  formId,
}: {
  children?: React.ReactNode;
  restrictToEditPaths?: boolean;
  refreshServerData?: boolean;
  formId: string;
}) => {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation("form-builder");
  const { language, isPublished } = useTemplateStore((s) => ({
    language: s.lang,
    isPublished: s.isPublished,
  }));
  const { takeover, getIsActiveTab, hasSessionExpired, isEnabled } = useEditLockContext();
  const { headlessTree } = useTreeRef();

  const showLockedEdit =
    isEnabled && !isPublished && (!restrictToEditPaths || isEditPath(pathname));

  const handleTakeover = async () => {
    await takeover();
    headlessTree?.current?.rebuildTree();

    // Refresh server-rendered data if needed (e.g., settings pages)
    if (refreshServerData) {
      router.refresh();
    }

    // Show success toast after takeover completes
    toast.success(t("editLock.syncedLatest"), "wide");
  };

  if (!showLockedEdit) {
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
        <EditLockSessionExpiredOverlay onReturnToForms={returnToForms} formId={formId} />
      ) : (
        <EditLockBanner takeover={handleTakeover} getIsActiveTab={getIsActiveTab} formId={formId} />
      )}
      {children}
    </>
  );
};
