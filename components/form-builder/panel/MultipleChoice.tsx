import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const MultipleChoiceWrapper = styled.div`
  display: block;
  float: none;
  clear: left;
  position: relative;
  padding: 0 0 0 38px;
  margin-bottom: 10px;
  input {
    position: absolute;
    cursor: pointer;
    left: 0;
    top: 0;
    width: 38px;
    height: 38px;
    z-index: 1;
    margin: 0;
    zoom: 1;
    filter: alpha(opacity=0);
    opacity: 0;
  }
  label {
    cursor: pointer;
    padding: 0 10px 5px 10px;
    display: block;
    -ms-touch-action: manipulation;
    touch-action: manipulation;
  }
  input:disabled {
    cursor: default;
  }
  input:disabled + label {
    zoom: 1;
    filter: alpha(opacity=50);
    opacity: 0.5;
    cursor: default;
  }
`;

const MultipleChoiceLabel = styled.label`
  input[type="radio"] + &::before {
    content: "";
    border: 1.5px solid;
    background: transparent;
    width: 34px;
    height: 34px;
    position: absolute;
    top: 0;
    left: 0;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
  }
  input[type="radio"] + &::after {
    content: "";
    border: 10px solid;
    width: 0;
    height: 0;
    position: absolute;
    top: 7px;
    left: 7px;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;
    zoom: 1;
    filter: alpha(opacity=0);
    opacity: 0;
  }
  input[type="checkbox"] + &::before {
    content: "";
    border: 1.5px solid;
    background: transparent;
    width: 34px;
    height: 34px;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: 4px;
  }
  input[type="checkbox"] + &::after {
    content: "";
    border: solid;
    border-width: 0 0 4px 4px;
    background: transparent;
    border-top-color: transparent;
    width: 21px;
    height: 13px;
    position: absolute;
    top: 7px;
    left: 7px;
    -moz-transform: rotate(-45deg);
    -o-transform: rotate(-45deg);
    -webkit-transform: rotate(-45deg);
    -ms-transform: rotate(-45deg);
    transform: rotate(-45deg);
    zoom: 1;
    filter: alpha(opacity=0);
    opacity: 0;
  }
  input[type="radio"]:focus + &::before {
    -webkit-box-shadow: 0 0 0 4px #303fc3;
    -moz-box-shadow: 0 0 0 4px #303fc3;
    box-shadow: 0 0 0 4px #303fc3;
  }
  input[type="checkbox"]:focus + &::before {
    -webkit-box-shadow: 0 0 0 3px #303fc3;
    -moz-box-shadow: 0 0 0 3px #303fc3;
    box-shadow: 0 0 0 3px #303fc3;
  }
  input:checked + &::after {
    zoom: 1;
    filter: alpha(opacity=100);
    opacity: 1;
  }
`;

const MultipleChoice = ({
  label,
  value,
  name,
  id,
  children,
  className,
  type,
  onBlur,
  onChange,
  onFocus,
  checked,
  ...props
}: {
  label?: JSX.Element | string;
  value?: string;
  name?: string;
  id?: string;
  children?: JSX.Element | string;
  className?: string;
  type: string;
  onBlur?: () => void;
  onChange?: () => void;
  onFocus?: () => void;
  checked?: boolean;
}) => (
  <MultipleChoiceWrapper className={className}>
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      checked={checked}
      {...props}
    />
    <MultipleChoiceLabel htmlFor={id} id={`${id}-label`}>
      {label}
    </MultipleChoiceLabel>
    {children}
  </MultipleChoiceWrapper>
);

MultipleChoice.propTypes = {
  type: PropTypes.string.isRequired,
  className: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  value: PropTypes.string.isRequired,
  name: PropTypes.string,
  id: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  checked: PropTypes.bool,
};

const Radio = ({ ...props }) => <MultipleChoice type={"radio"} {...props} />;

const Checkbox = ({ ...props }) => <MultipleChoice type="checkbox" {...props} />;

export { Radio, Checkbox };
