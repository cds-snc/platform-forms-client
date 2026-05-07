"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { isEditLockStatus } from "@lib/editLockStatus";
import { gaEditLock } from "../../../form-builder/components/shared/edit-lock/EditLockGA";

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
          navigateToEditor();
          gaEditLock({ formId, description: "accept_read_only" });
        }}
      >
        {t("continueReadOnly", { ns: "my-forms" })}
      </Button>

      <Button
        theme="secondary"
        onClick={() => {
          dialogRef.current?.close();
          setShowDialog(false);
          gaEditLock({ formId, description: "decline_read_only" });
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
