"use client";
import React, { type JSX } from "react";
// import { Field } from "formik";
import { Description } from "@clientComponents/forms";
import { ChoiceFieldProps } from "@lib/types";

export const Radio = (
  props: ChoiceFieldProps & JSX.IntrinsicElements["input"]
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

      {/* TODO this one will be difficult to remove */}

      {/* <Field */}
      <input
        className="gc-radio__input"
        id={id}
        type="radio"
        required={required}
        value={label} // This needs to be static... the actual label...
        name={name}
      />
      <label tabIndex={-1} className="gc-radio-label" htmlFor={id}>
        <span className="radio-label-text">{label}</span>
      </label>
    </div>
  );
};
