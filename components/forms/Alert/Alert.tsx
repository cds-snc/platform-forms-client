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
  slim,
  noIcon,
  className,
  validation,
  ...props
}: AlertProps & React.HTMLAttributes<HTMLDivElement>): React.ReactElement => {
  const classes = classnames(
    "gc-alert",
    {
      "gc-alert--success": type === "success",
      "gc-alert--warning": type === "warning",
      "gc-alert--error": type === "error",
      "gc-alert--info": type === "info",
      "gc-alert--slim": slim,
      "gc-alert--no-icon": noIcon,
      "gc-alert--validation": validation,
    },
    className
  );

  return (
    <div className={classes} data-testid="alert" {...props}>
      <div className="gc-alert__body">
        {heading && <h3 className="gc-alert__heading">{heading}</h3>}
        {children &&
          (validation ? (
            children
          ) : (
            <p className="gc-alert__text">{children}</p>
          ))}
      </div>
      {cta && <div>{cta}</div>}
    </div>
  );
};

export default Alert;
