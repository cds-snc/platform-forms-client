import React, { useEffect, useRef, createContext, useContext } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";

import { Button, FancyButton } from "./Button";
import { Close } from "../icons/Close";
import { CDSHTMLDialogElement } from "../types";
import useModalStore from "../store/useModalStore";

const StyledDialog = styled.dialog`
  padding: 0;
  background: transparent;
  margin: 0;
  background-clip: padding-box;
  width: 100%;
  max-width: none;
  max-height: none;
  height: 100%;

  .modal-content {
    width: 750px; /* TODO: fix this for mobile */
    margin: 1.75rem auto;
    border: 1.5px solid #000000;
    box-shadow: 0px 4px 0px -1px #000000;
    background: #ffffff;
    border-radius: 12px;
    outline: 0;
    max-height: none;
    overflow-x: scroll;

    position: relative;
    display: flex;
    flex-direction: column;
    pointer-events: auto;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px solid #cacaca;
  }

  .modal-title {
    padding-bottom: 15px;
  }

  .modal-body {
    position: relative;
    flex: 1 1 auto;
    padding: 15px;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 15px;
    border-top: 1px solid #cacaca;

    > *:first-child {
      margin-right: 20px;
    }
  }
`;

const CloseButton = styled(Button)`
  padding: 3px 5px;
  border: 1px solid #cacaca;
  border-radius: 2px;

  svg {
    margin-right: 3px;
  }
`;

const ModalCancelButton = styled(FancyButton)`
  padding: 15px 20px;
`;

interface IModalContext {
  isOpen: boolean;
  changeOpen: (open: boolean) => void;
}

const modalDefaultContext: IModalContext = {
  isOpen: false,
  changeOpen: () => null,
};

const ModalContext = createContext<IModalContext>(modalDefaultContext);

export const Modal = ({
  title,
  children,
  openButton,
  saveButton,
}: {
  title: string;
  children: React.ReactNode;
  openButton?: React.ReactElement;
  saveButton?: React.ReactElement | string | undefined;
}) => {
  const { updateIsOpen } = useModalStore();
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
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
      <button onClick={() => changeOpen(isOpenButton)}>
        {isOpenButton ? t("Open modal") : t("Close modal")}
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

  const close = () => {
    modalContainer.current?.close();
    changeOpen(false);
  };

  // focus modal when opened
  useEffect(() => {
    if (isOpen && modalContainer.current) {
      modalContainer.current.showModal();
      modalContainer.current.focus();
    } else {
      close();
    }

    document.body.style.overflow = isOpen ? "hidden" : "unset";
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
  }, []);

  if (!isOpen) {
    return null;
  }

  /* eslint-disable */
  return (
    <StyledDialog tabIndex={-1} role="dialog" onClick={close} ref={modalContainer}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <ModalButton isOpenButton={false}>
              <CloseButton icon={<Close />} onClick={close}>{t("Close")}</CloseButton>
            </ModalButton>
          </div>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            {saveButton}
            <ModalCancelButton onClick={close}>{t("Cancel")}</ModalCancelButton>
          </div>
        </div>
    </StyledDialog>
  );
  /* eslint-enable */
};

ModalContainer.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
};
