import React from "react";
import { Field } from "formik";
import { Description } from "@appComponents/forms";
import { ChoiceFieldProps } from "@lib/types";

export const Checkbox = (
  props: ChoiceFieldProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, label, required, name, ariaDescribedBy } = props;

  return (
    <div className="gc-input-checkbox" data-testid={id}>
      {ariaDescribedBy && (
        <Description id={id} className="gc-form-group-context">
          {ariaDescribedBy}
        </Description>
      )}
      <Field
        className="gc-input-checkbox__input"
        id={id}
        type="checkbox"
        value={label}
        required={required}
        name={name}
      />
      <label className="gc-checkbox-label" htmlFor={id}>
        <span className="checkbox-label-text">{label}</span>
      </label>
    </div>
  );
};
