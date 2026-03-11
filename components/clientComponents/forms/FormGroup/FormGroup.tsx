"use client";
import React from "react";
import { useField } from "formik";
import { cn } from "@lib/utils";

interface FormGroupProps {
  children: React.ReactNode;
  name: string;
  className?: string;
  ariaDescribedBy?: string;
  error?: boolean;
  required?: boolean;
}

export const FormGroup = (props: FormGroupProps): React.ReactElement => {
  const { children, name, className, ariaDescribedBy, error, required } = props;
  const [, meta] = useField(name);

  const hasError = error || !!meta.error;
  const classes = cn(
    "gc-form-group",
    "focus-group",
    { "gc-form-group--error": hasError },
    className
  );

  const describedByIds = ariaDescribedBy
    ? `errorMessage${name} ${ariaDescribedBy}`
    : `errorMessage${name}`;

  return (
    <fieldset
      name={name}
      id={name}
      data-testid="formGroup"
      className={classes}
      aria-describedby={hasError ? describedByIds : ariaDescribedBy || undefined}
      // help radio+checkboxes act more consistently (e.g. Chrome+TalkBack) when announcing a field is required
      aria-required={required}
      aria-invalid={hasError}
      // Used to programmatically focus a form group by e.g. a form validation skip ahead link
      // -1 is used over 0, so the group is not in the natural tab order which is confusing for AT
      tabIndex={-1}
    >
      {children}
    </fieldset>
  );
};
