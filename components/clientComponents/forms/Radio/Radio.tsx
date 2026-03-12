"use client";
import React, { type JSX } from "react";
import { Field, useField } from "formik";
import { Description } from "@clientComponents/forms";
import { ChoiceFieldProps } from "@lib/types";

export const Radio = (
  props: ChoiceFieldProps & JSX.IntrinsicElements["input"]
): React.ReactElement => {
  const { id, label, required, name, ariaDescribedBy } = props;
  const [, meta] = useField(name);
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
        // fix for VO that looks at individual radio inputs vs. all other browser+AT
        // that respect the parent if it has an aria-invalid
        aria-invalid={!!meta.error}
        value={label} // This needs to be static... the actual label...
        name={name}
      />
      <label tabIndex={-1} className="gc-radio-label" htmlFor={id}>
        <span className="radio-label-text">{label}</span>
      </label>
    </div>
  );
};
