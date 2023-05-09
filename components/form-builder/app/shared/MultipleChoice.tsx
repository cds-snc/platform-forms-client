import React from "react";
import PropTypes from "prop-types";

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
  <div className={className ? `${className} multiple-choice-wrapper` : "multiple-choice-wrapper"}>
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
    <label htmlFor={id} id={`${id}-label`}>
      {label}
    </label>
    {children}
  </div>
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
