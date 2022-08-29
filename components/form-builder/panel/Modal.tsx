import React, { useEffect } from "react";
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
  overflow: hidden;
  outline: 0;
  background-color: #ddddddaa;
  display: flex;
  align-items: center;
  justify-content: center;

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
    border: 2px solid rgba(0, 0, 0, 0.2);
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

export const Modal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) {
    return null;
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };

    // Close modal if "ESC" key is pressed
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* eslint-disable */

  return (
    <>
    <StyledDiv tabIndex={-1} role="dialog" onClick={() => onClose()}>
      <div className="modal-dialog" role="document" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Modal title</h5>
            <Button icon={<Close />} onClick={() => onClose()}></Button>
          </div>
          <div className="modal-body">
            <p>
              Modal body text goes here. Modal body text goes here. Modal body text goes here. Modal
              body text goes here. Modal body text goes here. Modal body text goes here. Modal body
              text goes here. Modal body text goes here. Modal body text goes here.
            </p>
          </div>
          <div className="modal-footer">
            <FancyButton onClick={() => {}}>Save changes</FancyButton>
            <FancyButton onClick={() => onClose()}>Close</FancyButton>
          </div>
        </div>
      </div>
    </StyledDiv>
    </>
  );
  /* eslint-enable */
};

Modal.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
};
