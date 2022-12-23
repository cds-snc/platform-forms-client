import React from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";

interface AlertProps {
  type: "success" | "warning" | "error" | "info";
  heading?: React.ReactNode;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  validation?: boolean;
  dismissible?: boolean;
  onDismiss?: React.ReactEventHandler;
}

export const Alert = ({
  type,
  heading,
  cta,
  children,
  className,
  validation,
  dismissible,
  onDismiss,
  ...props
}: AlertProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  const { t } = useTranslation("common");

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

  // currently there is not really an accepted practice with regards on how to dismiss alerts
  // see https://github.com/w3c/aria-practices/issues/663
  // the role alertdialog can be used but this requires the use of a modal and containing focus to be accessible
  // see https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
  return (
    <div className={classes} data-testid="alert" {...props} role="alert">
      {dismissible ? (
        <button
          id="dismissButton"
          aria-label={t("alert.dismissAlert")}
          className="gc-button gc-button--icon gc-button--secondary float-right"
          onClick={onDismiss}
        >
          x
        </button>
      ) : null}
      <div className="gc-alert__body">
        {heading && <h2>{heading}</h2>}
        {children && (validation ? children : <div className="gc-alert__text">{children}</div>)}
      </div>
      {cta && <div>{cta}</div>}
    </div>
  );
};
