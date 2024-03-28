import React from "react";
import { Description } from "@clientComponents/forms";
import { ChoiceFieldProps } from "@lib/types";

export const Radio = ({
  id,
  label,
  required,
  name,
  ariaDescribedBy,
}: ChoiceFieldProps & JSX.IntrinsicElements["input"]): React.ReactElement => {
  return (
    <div className="gc-input-radio">
      {ariaDescribedBy ? (
        <Description id={id} className="gc-form-group-context">
          {ariaDescribedBy}
        </Description>
      ) : (
        ""
      )}
      <input
        id={id}
        name={name}
        className="gc-radio__input"
        type="radio"
        required={required}
        value={label} // This needs to be static... the actual label...
      />
      <label className="gc-radio-label" htmlFor={id}>
        <span className="radio-label-text">{label}</span>
      </label>
    </div>
  );
};
