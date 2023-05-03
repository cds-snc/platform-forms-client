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
      className="p-0 bg-clip-padding w-full h-full bg-transparent"
      aria-labelledby="modal-title"
      ref={dialogRef}
    >
      <div
        className={`relative mx-8 tablet:max-w-[700px] overflow-y-scroll max-h-[80%] tablet:mx-auto mt-12 laptop:mt-24 bg-white border-2 border-black rounded-xl ${className}`}
      >
        {title && (
          <h2 className={headerStyle ? headerStyle : "pb-4 inline-block mt-4 ml-4"} tabIndex={-1}>
            {title}
          </h2>
        )}

        <div className={`px-4 ${title ? "" : "mt-10"}`}>{children}</div>
        {actions && <div className="py-4 px-4 border-t-1 border-gray-400 flex">{actions}</div>}
        <Button
          theme="link"
          className="group absolute right-0 top-0 mr-4 mt-4 z-[1000]"
          aria-label={t("close")}
          onClick={close}
          dataTestId="close-dialog"
        >
          <span className="block w-30 mr-2">
            <Close className="group-focus:fill-white-default inline-block mr-2" />
            {t("close")}
          </span>
        </Button>
      </div>
    </dialog>
  );
};
