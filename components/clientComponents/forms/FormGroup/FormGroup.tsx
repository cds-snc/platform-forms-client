"use client";
import React from "react";
import { cn } from "@lib/utils";
import { useField } from "formik";
import { getDescribedByIds, getErrorMessageId } from "@lib/a11yHelpers";

interface FormGroupProps {
  children: React.ReactNode;
  name: string;
  className?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;
  error?: boolean;
}

export const FormGroup = (props: FormGroupProps): React.ReactElement => {
  const { children, name, className, ariaDescribedBy, ariaLabelledBy, error } = props;

  const classes = cn("gc-form-group", "focus-group", { "gc-form-group--error": error }, className);

  const [, meta] = useField(name); // note name=id
  const errorMessageId = meta.error ? getErrorMessageId(name) : undefined; // Associate error only after validation fails
  const describedByIds = getDescribedByIds(errorMessageId, ariaDescribedBy);

  return (
    <fieldset
      name={name}
      id={name}
      data-testid="formGroup"
      className={classes}
      aria-describedby={describedByIds}
      aria-labelledby={ariaLabelledBy}
    >
      {children}
    </fieldset>
  );
};
