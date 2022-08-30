import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import { Button, FancyButton } from "./Button";
import { Close } from "../icons/Close";

const StyledDiv = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1050;
  outline: 0;
  background-color: #ddddddaa;

  overflow-x: hidden;
  overflow-y: auto;

  .modal-dialog {
    max-width: 500px;
    margin: 1.75rem auto;
  }

  .modal-content {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    pointer-events: auto;
    background-color: #fff;
    background-clip: padding-box;
    border: 2px solid #000000;
    box-shadow: 0px 4px 0px -1px #000000;
    border-radius: 12px;
    outline: 0;
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

export const Modal = ({
  title,
  children,
  isOpen,
  onClose,
}: {
  title: string;
  children: JSX.Element | string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const modalContainer = useRef<HTMLDivElement>(null);

  // focus modal when opened
  useEffect(() => {
    if (isOpen && modalContainer.current) {
      modalContainer.current.focus();
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
        onClose();
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
    <StyledDiv tabIndex={-1} role="dialog" onClick={() => onClose()} ref={modalContainer}>
      <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">{title}</h2>
            <Button icon={<Close />} onClick={() => onClose()}>Close</Button>
          </div>
          <div className="modal-body">
            {children}
          </div>
          <div className="modal-footer">
            <FancyButton onClick={() => {}}>Save changes</FancyButton>
            <FancyButton onClick={() => onClose()}>Close</FancyButton>
          </div>
        </div>
      </div>
    </StyledDiv>
  );
  /* eslint-enable */
};

Modal.propTypes = {
  title: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
