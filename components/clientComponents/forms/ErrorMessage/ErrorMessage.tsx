"use client";
import React from "react";
import { cn } from "@lib/utils";

export interface ErrorMessageProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
  role?: "alert" | false;
}

export const ErrorMessage = (props: ErrorMessageProps): React.ReactElement => {
  const { children, className, id, role = false } = props;

  const classes = cn("gc-error-message", className);

  return (
    <p data-testid="errorMessage" className={classes} id={id} {...(role ? { role } : {})}>
      <span className="gcds-icon gcds-icon-warning-triangle mr-10px inline-block"></span>
      <strong>{children}</strong>
    </p>
  );
};
