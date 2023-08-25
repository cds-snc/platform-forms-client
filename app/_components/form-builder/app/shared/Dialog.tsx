import React, { useCallback, useEffect, useRef, useState } from "react";
import { CDSHTMLDialogElement } from "../../types";
import { useTranslation } from "next-i18next";
import { Button } from "@appComponents/globals";
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
  headerStyle,
}: {
  dialogRef: React.RefObject<CDSHTMLDialogElement>;
  children: React.ReactElement;
  title?: string;
  actions?: React.ReactElement;
  className?: string;
  handleClose?: () => void;
  headerStyle?: string;
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
        className={`relative mx-8 mt-12 max-h-[80%] overflow-y-auto rounded-xl border-2 border-black bg-white tablet:mx-auto tablet:max-w-[700px] laptop:mt-24 ${className}`}
      >
        {title && (
          <h2 className={headerStyle ? headerStyle : "ml-4 mt-4 inline-block pb-4"} tabIndex={-1}>
            {title}
          </h2>
        )}

        <div className={`px-4 ${title ? "" : "mt-10"}`}>{children}</div>
        {actions && <div className="flex border-t-1 border-gray-400 p-4">{actions}</div>}
        <Button
          theme="link"
          className="group absolute right-0 top-0 z-[1000] mr-4 mt-4"
          aria-label={t("close")}
          onClick={close}
          dataTestId="close-dialog"
        >
          <span className="mr-2 block">
            <Close className="mr-2 inline-block group-focus:fill-white-default" />
            {t("close")}
          </span>
        </Button>
      </div>
    </dialog>
  );
};
