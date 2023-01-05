import React, { useCallback, useEffect, useRef, useState } from "react";
import { CDSHTMLDialogElement } from "../../types";
import { useTranslation } from "next-i18next";
import { Button } from "./Button";
import { Close } from "../../icons/Close";

export const useDialogRef = () => {
  const ref = useRef<CDSHTMLDialogElement>(null);
  return ref;
};

export const Dialog = ({
  dialogRef,
  children,
  title,
  actions,
  handleClose,
}: {
  dialogRef: React.RefObject<CDSHTMLDialogElement>;
  children: React.ReactElement;
  title?: string;
  actions?: React.ReactElement;
  handleClose?: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [isOpen, changeOpen] = useState(true);
  const close = useCallback(() => {
    dialogRef.current?.close();
    handleClose && handleClose();
    changeOpen(false);
  }, [dialogRef, handleClose]);

  useEffect(() => {
    const dialog = dialogRef?.current;
    if (isOpen) {
      dialog?.showModal();
    }
    return () => dialog?.close();
    // see: https://github.com/facebook/react/issues/24399
  }, [isOpen]);

  // Close modal if "ESC" key is pressed
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close]);

  return (
    <dialog className="modal-dialog" aria-labelledby="modal-title" ref={dialogRef}>
      <div className="modal-content">
        <div className="modal-header inline-flex justify-between">
          {title && <h2 className="modal-title">{title}</h2>}
          {!title && <div />}
          <Button
            theme="link"
            className="group justify-self-end block pl-2 pr-2"
            aria-label={t("close")}
            onClick={close}
          >
            <span className="block w-30 mr-2">
              <Close className="group-focus:fill-white-default inline-block mr-2" />
              {t("close")}
            </span>
          </Button>
        </div>
        <div className="modal-body">{children}</div>
        {actions && <div className="modal-footer">{actions}</div>}
      </div>
    </dialog>
  );
};
