import React, { useEffect, useRef, useState } from "react";
import { CDSHTMLDialogElement } from "../types";
import { useTranslation } from "next-i18next";
import { Button } from "../shared/Button";
import { Close } from "../icons/Close";

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
  title: string;
  actions: React.ReactElement;
  handleClose?: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const [isOpen, changeOpen] = useState(true);
  const close = () => {
    dialogRef.current?.close();
    handleClose && handleClose();
    changeOpen(false);
  };

  useEffect(() => {
    const dialog = dialogRef?.current;
    if (isOpen) {
      dialog?.showModal();
    }
    return () => dialog?.close();
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
  }, []);

  return (
    <dialog className="modal-dialog" aria-labelledby="modal-title" ref={dialogRef}>
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <Button
            theme="icon"
            className="group"
            icon={<Close className="group-focus:fill-white-default" />}
            aria-label={t("Close")}
            onClick={close}
          ></Button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">{actions}</div>
      </div>
    </dialog>
  );
};
