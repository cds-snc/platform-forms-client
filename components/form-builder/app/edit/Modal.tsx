import React, { useEffect, useRef, createContext, useContext, useCallback } from "react";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";

import { Button } from "../shared";
import { Close } from "../../icons";
import { CDSHTMLDialogElement } from "../../types";
import { useModalStore } from "../../store";

interface IModalContext {
  isOpen: boolean;
  changeOpen: (open: boolean) => void;
}

const modalDefaultContext: IModalContext = {
  isOpen: false,
  changeOpen: () => null,
};

export const ModalContext = createContext<IModalContext>(modalDefaultContext);

export const Modal = ({
  title,
  children,
  openButton,
  saveButton,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  openButton?: React.ReactElement;
  saveButton?: React.ReactElement | string | undefined;
  defaultOpen?: boolean;
}) => {
  const { updateIsOpen } = useModalStore();
  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen);
  const changeOpen = (open: boolean) => {
    setIsOpen(open);
    updateIsOpen(open);
  };

  return (
    <ModalContext.Provider value={{ isOpen, changeOpen }}>
      {openButton ? (
        <ModalButton isOpenButton={true}>{openButton}</ModalButton>
      ) : (
        <ModalButton isOpenButton={true} />
      )}

      <ModalContainer title={title} saveButton={saveButton}>
        {children}
      </ModalContainer>
    </ModalContext.Provider>
  );
};

Modal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type CallBack = (...args: any[]) => void;

const callAll =
  (...fns: Array<CallBack | undefined>) =>
  (
    ...args: any[] // eslint-disable-line  @typescript-eslint/no-explicit-any
  ) =>
    fns.forEach((fn) => typeof fn === "function" && fn(...args));

export const ModalButton = ({
  isOpenButton,
  children,
}: {
  isOpenButton: boolean;
  children?: React.ReactElement;
}) => {
  const { t } = useTranslation("form-builder");
  const { changeOpen } = useContext(ModalContext);

  if (!children) {
    return (
      <button
        onClick={() => {
          changeOpen(isOpenButton);
        }}
      >
        {isOpenButton ? t("openModal") : t("closeModal")}
      </button>
    );
  }

  // Note: This will not work if children is more than 1 element
  return React.cloneElement(children, {
    onClick: callAll(() => changeOpen(isOpenButton), children.props.onClick),
  });
};

ModalButton.propTypes = {
  isOpenButton: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.element]),
};

export const ModalContainer = ({
  title,
  children,
  saveButton,
}: {
  title: string;
  children: React.ReactNode;
  saveButton?: React.ReactElement | string | undefined;
}) => {
  const { t } = useTranslation("form-builder");
  const { isOpen, changeOpen } = useContext(ModalContext);

  const modalContainer = useRef<CDSHTMLDialogElement>(null);

  const close = useCallback(() => {
    modalContainer.current?.close();
    changeOpen(false);
  }, [changeOpen]);

  // focus modal when opened
  useEffect(() => {
    if (isOpen && modalContainer.current) {
      modalContainer.current.showModal();
      modalContainer.current.focus();
    } else {
      close();
    }

    document.body.style.overflow = isOpen ? "hidden" : "unset";
    // see: https://github.com/facebook/react/issues/24399
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Trap focus in the modal
  useEffect(() => {
    const handleFocusIn = ({ target }: FocusEvent) => {
      if (modalContainer.current && !modalContainer.current.contains(target as Node)) {
        modalContainer.current.focus();
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

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

  if (!isOpen) {
    return null;
  }

  /* eslint-disable */
  return (
    <dialog data-testid="modal" className="p-0 bg-clip-padding w-full h-full bg-transparent" tabIndex={-1} role="dialog" onClick={close} ref={modalContainer}>
      <div data-testid="modal-content" className="mx-8 p-4 laptop:max-w-[800px] h-5/6 overflow-scroll laptop:mx-auto mt-10 bg-white border-2 border-black rounded-xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <h2>{title}</h2>
          <ModalButton isOpenButton={false}>
            <Button
              theme="link"
              className="group absolute top-0 right-0 block pl-2 pr-2"
              aria-label={t("close")}
              onClick={close}
            >
              <span className="block w-30 mr-2">
                <Close className="group-focus:fill-white-default inline-block mr-2" />
                {t("close")}
              </span>
            </Button>
          </ModalButton>
        </div>
        <div>
          {children}
        </div>
        <div>
          {saveButton}
          <Button theme="secondary" onClick={close}>{t("cancel")}</Button>
        </div>
      </div>
    </dialog>
  );
  /* eslint-enable */
};

ModalContainer.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};
