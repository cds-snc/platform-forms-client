import React, { ReactElement } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

const StyledButton = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  color: #000;
  margin: 5px;
  max-height: 24px;

  &:hover {
    background: #ebebeb;
  }

  svg {
    margin-right 5px;
  }
`;

export const Button = ({
  children,
  icon,
  onClick,
}: {
  children?: JSX.Element | string;
  icon: ReactElement;
  onClick: () => void;
}) => {
  return (
    <StyledButton onClick={onClick}>
      {icon}
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  icon: PropTypes.element,
  onClick: PropTypes.func,
};

const FancyStyledButton = styled.button`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  line-height: 1.2;
  font-weight: 400;
  position: relative;
  padding: 4px 10px;
  border: 1.5px solid black;
  border-radius: 8px;
  box-shadow: inset 0 -2px 0 #ddd;
  cursor: pointer;
  background: #ffffff;

  &:hover:not(:disabled) {
    color: rgba(0, 0, 0, 0.8);
    background: #f9f9f9;
    box-shadow: inset 0 -2px 0 #ccc;
  }

  &:focus {
    outline: #303fc3 2px dotted;
    outline-offset: 2px;
  }

  &:active:not(:disabled) {
    top: 2px;
    box-shadow: none;
  }

  &:disabled {
    background: #f5f5f5;
    color: rgba(0, 0, 0, 0.7);
    border-color: rgba(0, 0, 0, 0.7);
    cursor: not-allowed;
  }
`;

export const FancyButton = ({
  children,
  onClick,
}: {
  children?: JSX.Element | string;
  onClick: () => void;
}) => {
  return <FancyStyledButton onClick={onClick}>{children}</FancyStyledButton>;
};

FancyButton.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  onClick: PropTypes.func,
};
