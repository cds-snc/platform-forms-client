import React from "react";
import classnames from "classnames";

export interface ErrorMessageProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const ErrorMessage = (props: ErrorMessageProps): React.ReactElement => {
  const { children, className, id } = props;

  const classes = classnames("gc-error-message", className);

  return (
    <p data-testid="errorMessage" className={classes} id={id} role="alert">
      {children}
    </p>
  );
};

export default ErrorMessage;
