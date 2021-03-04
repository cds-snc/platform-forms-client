import React from "react";
import classnames from "classnames";

interface FormGroupProps {
  children: React.ReactNode;
  name: string;
  className?: string;
  ariaDescribedBy?: string;
  error?: boolean;
}

export const FormGroup = (props: FormGroupProps): React.ReactElement => {
  const { children, name, className, ariaDescribedBy, error } = props;

  const classes = classnames("gc-form-group", { "gc-form-group--error": error }, className);

  return (
    <fieldset
      name={name}
      id={name}
      data-testid="formGroup"
      className={classes}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </fieldset>
  );
};

export default FormGroup;
