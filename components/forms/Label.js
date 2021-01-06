import React from "react";
import PropTypes from "prop-types";

/**
 * Primary UI component for user interaction
 */
export const Label = ({ label, forInput, ...props }) => {
  return (
    <label htmlFor={forInput} className="gc-label" {...props}>
      {label}
    </label>
  );
};

Label.propTypes = {
  /**
   * Button contents
   */
  label: PropTypes.string.isRequired,
  forInput: PropTypes.string,
};

Label.defaultProps = {
  label: "",
  forInput: "",
};

export default Label;
