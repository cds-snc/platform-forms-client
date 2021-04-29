import React from "react";
import classnames from "classnames";

interface LabelProps {
  children: React.ReactNode;
  htmlFor: string;
  className?: string;
  error?: boolean;
  hint?: React.ReactNode;
  srOnly?: boolean;
  required?: boolean;
}

export const Label = (props: LabelProps): React.ReactElement => {
  const { children, htmlFor, className, error, hint, srOnly, required } = props;

  const classes = classnames(
    {
      "gc-label": !srOnly,
      "gc-sr-only": srOnly,
      "gc-label--error": error,
    },
    className
  );

  return (
    <label data-testid="label" className={classes} htmlFor={htmlFor}>
      {children} {required ? <span aria-label="required">*</span> : null}
      {hint && <span className="gc-hint">{hint}</span>}
    </label>
  );
};

export default Label;
