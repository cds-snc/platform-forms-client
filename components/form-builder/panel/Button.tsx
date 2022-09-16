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
  border-radius: 8px;

  &:hover, &:focus, &:active {
    color: #ffffff;

    svg {
      fill: #ffffff;
    }
  }

  &:hover {
    background-color: #6a6d7b;
  }

  &:focus {
    background-color: #303fc3;
    outline: 3px solid #303fc3;
    outline-offset: 2px;
  }

  &:active {
    background-color: #c4c3c5
  }

  svg {
    margin-right 5px;
  }
`;

export const Button = ({
  children,
  icon,
  onClick,
  className,
  disabled = false,
}: {
  children?: JSX.Element | string;
  icon?: ReactElement;
  onClick: (e: React.MouseEvent<HTMLElement>) => void;
  className?: string;
  disabled?: boolean;
}) => {
  return (
    <StyledButton onClick={onClick} className={className} disabled={disabled}>
      {icon}
      {children}
    </StyledButton>
  );
};

Button.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  icon: PropTypes.element,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export const FancyButton = styled(Button)`
  max-height: unset;
  margin: unset;
  line-height: 1.2;
  font-weight: 400;
  position: relative;
  padding: 10px 15px;
  border: 1.5px solid black;
  cursor: pointer;
  background: #ffffff;

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
