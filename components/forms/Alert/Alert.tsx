import React from "react";
import classnames from "classnames";

interface AlertProps {
  type: "success" | "warning" | "error" | "info";
  heading?: React.ReactNode;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  slim?: boolean;
  noIcon?: boolean;
  validation?: boolean;
}

export const Alert = ({
  type,
  heading,
  cta,
  children,
  className,
  validation,
  ...props
}: AlertProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  const classes = classnames(
    "gc-alert",
    {
      "gc-alert--success": type === "success",
      "gc-alert--warning": type === "warning",
      "gc-alert--error": type === "error",
      "gc-alert--info": type === "info",
      "gc-alert--validation": validation,
    },
    className
  );

  return (
    <div className={classes} data-testid="alert" {...props} role="alert">
      <div className="gc-alert__body">
        {heading && <h2 className="gc-h3">{heading}</h2>}
        {children && (validation ? children : <div className="gc-alert__text">{children}</div>)}
      </div>
      {cta && <div>{cta}</div>}
    </div>
  );
};

export default Alert;
