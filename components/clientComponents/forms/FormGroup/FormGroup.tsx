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
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
    >
      {children}
    </fieldset>
  );
};
