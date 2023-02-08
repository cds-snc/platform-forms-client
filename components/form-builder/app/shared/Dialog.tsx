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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="w-[750px] mx-auto my-8 bg-white border-2 border-black rounded-md">
        <div className="relative">
          {title && <h2 className="modal-title inline-block">{title}</h2>}
          <Button
            theme="link"
            className="group absolute right-0 top-0 mr-4 mt-4"
            aria-label={t("close")}
            onClick={close}
          >
            <span className="block w-30 mr-2">
              <Close className="group-focus:fill-white-default inline-block mr-2" />
              {t("close")}
            </span>
          </Button>
        </div>
        <div className="">{children}</div>
        {actions && <div className="modal-footer">{actions}</div>}
      </div>
    </dialog>
  );
};
