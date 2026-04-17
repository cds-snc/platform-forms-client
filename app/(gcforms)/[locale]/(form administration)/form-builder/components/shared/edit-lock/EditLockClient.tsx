"use client";

import { useCallback, useState } from "react";
import { usePathname } from "next/navigation";
import { useEditLock } from "@lib/hooks/form-builder/useEditLock";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import {
  clearTakeoverDiffSnapshot,
  readTakeoverDiffSnapshot,
  writeTakeoverDiffSnapshot,
  type TakeoverDiffSnapshot,
} from "@lib/utils/form-builder/takeoverDiff";
import { EditLockBanner } from "@formBuilder/components/shared/edit-lock/EditLockBanner";
import { TakeoverDiffPanel } from "@formBuilder/components/shared/edit-lock/TakeoverDiffPanel";

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
  const currentFormId = useTemplateStore((s) => s.id);
  const activeFormId = currentFormId || formId;
  const enabled =
    lockedEditingEnabled &&
    process.env.NEXT_PUBLIC_APP_ENV !== "test" &&
    (!restrictToEditPaths || isEditPath(pathname)) &&
    activeFormId !== "0000";
  const [sessionId] = useState(() => makeSessionId());
  const [takeoverDiff, setTakeoverDiff] = useState<TakeoverDiffSnapshot | null>(() =>
    readTakeoverDiffSnapshot(activeFormId)
  );

  const { takeover } = useEditLock({ formId: activeFormId, enabled, sessionId });

  const handleTakeover = useCallback(async () => {
    const diffSnapshot = await takeover();

    if (diffSnapshot) {
      setTakeoverDiff(diffSnapshot);
      writeTakeoverDiffSnapshot(activeFormId, diffSnapshot);
    } else {
      setTakeoverDiff(null);
      clearTakeoverDiffSnapshot(activeFormId);
    }

    if (reloadOnTakeover) {
      window.location.reload();
    }
  }, [activeFormId, reloadOnTakeover, takeover]);

  if (!enabled) {
    return children ? <>{children}</> : null;
  }

  return (
    <>
      {takeoverDiff && (
        <TakeoverDiffPanel
          formId={activeFormId}
          snapshot={takeoverDiff}
          onDismiss={() => setTakeoverDiff(null)}
        />
      )}
      <EditLockBanner takeover={handleTakeover} />
      {children}
    </>
  );
};
