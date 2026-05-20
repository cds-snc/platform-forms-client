"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { isEditLockStatus } from "@lib/editLockStatus";
import { ga } from "@lib/client/clientHelpers";

export const DraftEditLink = ({
  href,
  formId,
  className,
  menuPopoverId,
  menuButtonId,
  children,
}: {
  href: string;
  formId: string;
  className?: string;
  menuPopoverId?: string;
  menuButtonId?: string;
  children: React.ReactNode;
}) => {
  const router = useRouter();
  const dialogRef = useDialogRef();
  const { t } = useTranslation(["my-forms", "form-builder", "common"]);
  const [isChecking, setIsChecking] = useState(false);
  const [lockedByName, setLockedByName] = useState<string | null>(null);
  const [collaboratorCount, setCollaboratorCount] = useState<number | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  const navigateToEditor = () => {
    router.push(href);
  };

  const handleEditClick = async () => {
    if (isChecking) {
      return;
    }

    if (menuPopoverId) {
      const menuPopover = document.getElementById(menuPopoverId);

      try {
        menuPopover?.hidePopover();
      } catch {
        // noop
      }
    }

    if (menuButtonId) {
      document.getElementById(menuButtonId)?.removeAttribute("aria-expanded");
    }

    setIsChecking(true);

    // Edit lock status is dynamic so a fetch is needed vs. using static props passed
    // down from the layout level. Dynamic because a user can open a form in Edit mode
    // then invite a user and change from Edit to Lock mode.
    try {
      const response = await fetch(`/api/templates/${formId}/edit-lock`, {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        navigateToEditor();
        return;
      }

      const payload = (await response.json().catch(() => null)) as unknown;
      if (!isEditLockStatus(payload) || !payload.lockedByOther) {
        navigateToEditor();
        return;
      }

      const name = payload.lock?.lockedByName || payload.lock?.lockedByEmail || null;
      setLockedByName(name);

      const collaboratorCount =
        typeof payload.pendingUserCount === "number" && typeof payload.userCount === "number"
          ? payload.pendingUserCount + payload.userCount
          : null;
      setCollaboratorCount(collaboratorCount);

      setShowDialog(true);
    } catch {
      navigateToEditor();
    } finally {
      setIsChecking(false);
    }
  };

  const actions = (
    <div className="flex gap-4">
      <Button
        theme="primary"
        onClick={() => {
          dialogRef.current?.close();
          setShowDialog(false);
          ga("edit_lock_accept_read_only", {
            formId,
            timestamp: Date.now(),
            location: "forms",
            ...(collaboratorCount !== null && { userCount: collaboratorCount }),
          });
          navigateToEditor();
        }}
      >
        {t("continueReadOnly", { ns: "my-forms" })}
      </Button>

      <Button
        theme="secondary"
        onClick={() => {
          dialogRef.current?.close();
          setShowDialog(false);
          ga("edit_lock_decline_read_only", {
            formId,
            timestamp: Date.now(),
            location: "forms",
            ...(collaboratorCount !== null && { userCount: collaboratorCount }),
          });
        }}
      >
        {t("cancel", { ns: "form-builder" })}
      </Button>
    </div>
  );

  const editorName = lockedByName || t("editLock.unknownUser", { ns: "form-builder" });

  return (
    <>
      <button
        type="button"
        className={className}
        onClick={handleEditClick}
        disabled={isChecking}
        aria-busy={isChecking}
        style={{ cursor: isChecking ? "progress" : "pointer" }}
      >
        {children}
      </button>
      {showDialog && (
        <div className="form-builder">
          <Dialog
            title={t("card.editLock.title", { ns: "my-forms" })}
            dialogRef={dialogRef}
            actions={actions}
            handleClose={() => setShowDialog(false)}
          >
            <div className="mx-5 my-8 flex flex-col gap-4">
              <p>{t("card.editLock.description", { ns: "my-forms", name: editorName })}</p>
            </div>
          </Dialog>
        </div>
      )}
    </>
  );
};
