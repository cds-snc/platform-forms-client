"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { EditLockBanner } from "@formBuilder/components/shared/edit-lock/EditLockBanner";

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
  const pathname = usePathname();
  const currentFormId = useTemplateStore((s) => s.id);
  const activeFormId = currentFormId || formId;
  const enabled =
    lockedEditingEnabled &&
    process.env.NEXT_PUBLIC_APP_ENV !== "test" &&
    (!restrictToEditPaths || isEditPath(pathname)) &&
    activeFormId !== "0000";
  const [sessionId] = useState(() => makeSessionId());

  const { takeover } = useEditLock({ formId: activeFormId, enabled, sessionId });

  const handleTakeover = useCallback(async () => {
    await takeover();

    if (reloadOnTakeover) {
      window.location.reload();
    }
  }, [reloadOnTakeover, takeover]);

  if (!enabled) {
    return children ? <>{children}</> : null;
  }

  return (
    <>
      <EditLockBanner takeover={handleTakeover} />
      {children}
    </>
  );
};
