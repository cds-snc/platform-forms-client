import React, {
  useEffect,
  createContext,
  useContext,
  useCallback,
  useImperativeHandle,
  useRef,
} from "react";
import { useTranslation } from "@i18n/client";
import PropTypes from "prop-types";

import { Button } from "@clientComponents/globals";
import { Close } from "@serverComponents/icons";
import { CDSHTMLDialogElement } from "@lib/types/form-builder-types";
import { useModalStore } from "@lib/store/useModalStore";

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
  handleClose = () => null,
  modalRef,
  noOpenButton,
}: {
  title: string;
  children: React.ReactNode;
  openButton?: React.ReactElement | undefined;
  saveButton?: React.ReactElement | string | undefined;
  defaultOpen?: boolean;
  handleClose?: () => void;
  modalRef?: React.RefObject<HTMLDivElement> | undefined;
  noOpenButton?: boolean;
}) => {
  const { updateIsOpen } = useModalStore();
  const [isOpen, setIsOpen] = React.useState<boolean>(defaultOpen);

  const changeOpen = useCallback(
    (open: boolean) => {
      setIsOpen(open);
      updateIsOpen(open);
    },
    [updateIsOpen, setIsOpen]
  );

  return (
    <ModalContext.Provider value={{ isOpen, changeOpen }}>
      {openButton ? (
        <ModalButton isOpenButton={true}>{openButton}</ModalButton>
      ) : (
        !noOpenButton && <ModalButton isOpenButton={true} />
      )}

      <ModalContainer
        modalRef={modalRef}
        title={title}
        saveButton={saveButton}
        handleClose={handleClose}
      >
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
  handleClose = () => null,
  modalRef,
}: {
  title: string;
  children: React.ReactNode;
  saveButton?: React.ReactElement | string | undefined;
  handleClose?: () => void;
  modalRef?: React.RefObject<HTMLDivElement> | undefined;
}) => {
  const { t } = useTranslation("form-builder");
  const { isOpen, changeOpen } = useContext(ModalContext);
  const modalContainer = useRef<CDSHTMLDialogElement>(null);
  useImperativeHandle(
    modalRef,
    () =>
      ({
        close: () => {
          changeOpen(false);
        },
        showModal: () => {
          changeOpen(true);
        },
      } as unknown as HTMLDivElement),
    [changeOpen]
  );

  const close = useCallback(() => {
    modalContainer && modalContainer.current?.close();
    changeOpen(false);
    handleClose && handleClose();
  }, [changeOpen, handleClose, modalContainer]);

  // focus modal when opened
  useEffect(() => {
    if (isOpen && modalContainer && modalContainer.current) {
      modalContainer.current.showModal();
      modalContainer.current.focus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Trap focus in the modal
  useEffect(() => {
    const handleFocusIn = ({ target }: FocusEvent) => {
      if (
        modalContainer &&
        modalContainer.current &&
        !modalContainer.current.contains(target as Node)
      ) {
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
    return <div ref={modalRef}></div>;
  }

  /* eslint-disable */
  return (
    <div ref={modalRef}>
      <dialog
        data-testid="modal"
        className="p-0 bg-clip-padding w-full h-full bg-transparent"
        tabIndex={-1}
        role="dialog"
        onClick={close}
        ref={modalContainer}
      >
        <div
          data-testid="modal-content"
          className="relative mx-8 p-4 laptop:max-w-[800px] h-5/6 overflow-scroll laptop:mx-auto mt-10 bg-white border-2 border-black rounded-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <h2>{title}</h2>
          <div>{children}</div>
          <div>
            {saveButton}
            <Button theme="secondary" onClick={close}>
              {t("cancel")}
            </Button>
          </div>
          <ModalButton isOpenButton={false}>
            <Button
              theme="link"
              className="group absolute top-0 right-0 mt-4 mr-4 block pl-2 pr-2"
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
      </dialog>
    </div>
  );
  /* eslint-enable */
};

ModalContainer.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};
