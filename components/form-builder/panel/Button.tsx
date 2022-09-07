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
  children?: JSX.Element;
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
