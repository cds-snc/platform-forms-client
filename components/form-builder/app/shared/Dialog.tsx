import React, { useCallback, useEffect, useRef, useState } from "react";
import { CDSHTMLDialogElement } from "../../types";
import { useTranslation } from "next-i18next";
import { Button } from "@components/globals";
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
  className,
  handleClose,
}: {
  dialogRef: React.RefObject<CDSHTMLDialogElement>;
  children: React.ReactElement;
  title?: string;
  actions?: React.ReactElement;
  className?: string;
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
    <dialog
      className="h-full w-full bg-transparent bg-clip-padding p-0"
      aria-labelledby="modal-title"
      ref={dialogRef}
    >
      <div
        className={`relative max-h-[80%] overflow-y-auto rounded-xl border-1 border-slate-500 bg-white tablet:mx-auto tablet:max-w-[700px] laptop:mt-24 ${className}`}
      >
        {title && (
          <div className="border-b-[0.5px] border-slate-500 bg-slate-50">
            <h2 className="ml-4 mt-4 inline-block text-2xl" tabIndex={-1}>
              {title}
            </h2>
          </div>
        )}

        <div>{children}</div>
        {actions && <div className="flex p-4">{actions}</div>}
        <Button
          theme="link"
          className="group absolute right-0 top-0 z-[1000] mr-4 mt-4"
          aria-label={t("close")}
          onClick={close}
          dataTestId="close-dialog"
        >
          <span className="block">
            <Close className="inline-block group-focus:fill-white-default" />
          </span>
        </Button>
      </div>
    </dialog>
  );
};
