import React from "react";
import { Field } from "formik";
import { MultipleChoiceProps } from "../../../lib/types";
import { Description } from "../Description/Description";

export const Radio = (
  props: MultipleChoiceProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, label, required, name, ariaDescribedBy } = props;

  return (
    <div className="gc-input-radio">
      {ariaDescribedBy ? (
        <Description id={id} className="gc-form-group-context">
          {ariaDescribedBy}
        </Description>
      ) : (
        ""
      )}
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
