"use client";
import React, { type JSX } from "react";
import { Field } from "formik";
import { Description } from "@clientComponents/forms";
import { ChoiceFieldProps } from "@lib/types";
import type { JSX } from "react";

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
      {/* Set tabIndex to -1 see https://stackoverflow.com/questions/49662769/focus-within-styles-flash-when-clicking-an-input-label  */}
      <label tabIndex={-1} className="gc-checkbox-label" htmlFor={id}>
        <span className="checkbox-label-text">{label}</span>
      </label>
    </div>
  );
};
