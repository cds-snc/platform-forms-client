import React, { useEffect, useRef, createContext, useContext } from "react";
import styled from "styled-components";
import { useTranslation } from "next-i18next";
import PropTypes from "prop-types";

import { Button, FancyButton } from "./Button";
import { Close } from "../icons/Close";

const StyledDialog = styled.dialog`
  width: 750px; /* TODO: fix this for mobile */
  padding: 0;
  background: transparent;
  margin: 1.75rem auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 2px solid #000000;
  box-shadow: 0px 4px 0px -1px #000000;
  border-radius: 12px;
  outline: 0;

  .modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 15px;
    border-bottom: 1px solid #e9ecef;
  }

  .modal-body {
    position: relative;
    flex: 1 1 auto;
    padding: 15px;
  }

  .modal-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 15px;
    border-top: 1px solid #e9ecef;
  }
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
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const changeOpen = (open: boolean) => {
    setIsOpen(open);
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

type CallBack = (...args: any[]) => void;

const callAll =
  (...fns: Array<CallBack | undefined>) =>
  (...args: any[]) =>
    fns.forEach((fn) => typeof fn === "function" && fn(...args));

export const ModalButton = ({
  isOpenButton,
  children,
}: {
  isOpenButton: boolean;
  children?: React.ReactElement;
}) => {
  const { changeOpen } = useContext(ModalContext);

  if (!children) {
    return (
      <button onClick={() => changeOpen(isOpenButton)}>
        {isOpenButton ? "Open modal" : "Close modal"}
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

  const modalContainer = useRef<HTMLDialogElement>(null);

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
              <Button icon={<Close />} onClick={close}>{t("Close")}</Button>
            </ModalButton>
          </div>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            {saveButton}
            <FancyButton onClick={close}>{t("Cancel")}</FancyButton>
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
