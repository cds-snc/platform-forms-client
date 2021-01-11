import React from "react";
import classnames from "classnames";

interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
  error?: boolean;
}

export const FormGroup = (props: FormGroupProps): React.ReactElement => {
  const { children, className, error } = props;

  const classes = classnames(
    "gc-form-group",
    { "gc-form-group--error": error },
    className
  );

  return (
    <div data-testid="formGroup" className={classes}>
      {children}
    </div>
  );
};

export default FormGroup;
