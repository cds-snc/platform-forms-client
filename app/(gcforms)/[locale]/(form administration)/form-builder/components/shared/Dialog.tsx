"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { CDSHTMLDialogElement } from "@lib/types/form-builder-types";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { Close } from "@serverComponents/icons/Close";
import { cn } from "@lib/utils";
import { randomId } from "@lib/client/clientHelpers";

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
  dialogRef: React.RefObject<CDSHTMLDialogElement | null>;
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
        handleClose && handleClose();
        close();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [close, handleClose]);

  // Avoids duplicate id for the case of more than one dialog in the DOM
  const modalRandomId = useRef(randomId());

  return (
    <dialog
      className="size-full bg-transparent bg-clip-padding p-0"
      {...(title && { "aria-labelledby": `modal-title-${modalRandomId.current}` })}
      ref={dialogRef}
      data-testid="dialog"
    >
      <div
        className={cn(
          `relative max-h-[80%] overflow-y-auto rounded-xl border-1 border-slate-500 bg-white tablet:mx-auto max-w-[700px] laptop:mt-24`,
          className
        )}
      >
        {title && (
          <div className="border-b-[0.5px] border-slate-500 bg-slate-50">
            <h2
              className="ml-4 mt-4 inline-block pb-4 text-2xl"
              id={`modal-title-${modalRandomId.current}`}
              tabIndex={-1}
            >
              {title}
            </h2>
          </div>
        )}

        <>{children}</>
        {actions && (
          <div className="sticky bottom-0 flex border-t-[0.5px] border-slate-500 bg-white p-4">
            {actions}
          </div>
        )}
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
