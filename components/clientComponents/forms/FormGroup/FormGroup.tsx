"use client";
import React from "react";
import { cn } from "@lib/utils";

interface FormGroupProps {
  children: React.ReactNode;
  name: string;
  className?: string;
  ariaDescribedBy?: string;
  error?: boolean;
}

export const FormGroup = (props: FormGroupProps): React.ReactElement => {
  const { children, name, className, ariaDescribedBy, error } = props;

  const classes = cn("gc-form-group", "focus-group", { "gc-form-group--error": error }, className);

  return (
    <fieldset
      name={name}
      id={name}
      data-testid="formGroup"
      className={classes}
      aria-describedby={ariaDescribedBy}
      // Used to programmatically focus a form group by e.g. a form validation skip ahead link
      // -1 is used over 0, so the group is not in the natural tab order which is confusing for AT
      tabIndex={-1}
    >
      {children}
    </fieldset>
  );
};
