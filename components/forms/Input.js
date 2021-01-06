import React from "react";
import PropTypes from "prop-types";
import Label from "./Label";

/**
 * Primary UI component for user interaction
 */
export const Input = ({ label, name, value, onChange, ...props }) => {
  return (
    <React.Fragment>
      <Label forInput={name} label={label} />
      <input
        type="text"
        name={name}
        className="gc-input-text"
        placeholder={value}
        onChange={onChange}
      />
    </React.Fragment>
  );
};

Input.propTypes = {
  /**
   * Button contents
   */
  label: PropTypes.string.isRequired,
};

Input.defaultProps = {
  label: "",
  name: "",
};

export default Input;
