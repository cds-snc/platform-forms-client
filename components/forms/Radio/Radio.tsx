import React from "react";
import { Field } from "formik";
import { MultipleChoiceProps } from "../../../lib/types";

export const Radio = (
  props: MultipleChoiceProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, label, required, name } = props;

  return (
    <div className="gc-input-radio">
      <Field
        className="gc-radio__input"
        id={id}
        type="radio"
        required={required}
        value={label} // This needs to be static... the actual label...
        name={name}
      />
      <label className="gc-radio-label" htmlFor={id}>
        <span className="radio-label-text">{label}</span>
      </label>
    </div>
  );
};

export default Radio;
