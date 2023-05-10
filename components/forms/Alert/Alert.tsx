import React, { useEffect, useRef } from "react";
import classnames from "classnames";
import { useTranslation } from "next-i18next";

export enum ErrorStatus {
  SUCCESS,
  WARNING,
  ERROR,
  INFO,
}

interface AlertProps {
  type: ErrorStatus;
  heading?: React.ReactNode;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  validation?: boolean;
  dismissible?: boolean;
  onDismiss?: React.ReactEventHandler;
  focussable?: boolean;
}

export const Alert = ({
  type,
  heading,
  cta,
  children,
  className,
  validation,
  dismissible = false, // Use only in rare cases because this will be inconsistent with other alert designs
  onDismiss,
  focussable = false,
  ...props
}: AlertProps & JSX.IntrinsicElements["div"]): React.ReactElement => {
  const { t } = useTranslation("common");
  const refFocus = useRef<HTMLDivElement>(null);
  const classes = classnames(
    "gc-alert",
    {
      "gc-alert--success": type === ErrorStatus.SUCCESS,
      "gc-alert--warning": type === ErrorStatus.WARNING,
      "gc-alert--error": type === ErrorStatus.ERROR,
      "gc-alert--info": type === ErrorStatus.INFO,
      "gc-alert--validation": validation,
    },
    className
  );

  // Used to focus on showing. Purely for visual users, the role=alert takes care of AT users.
  useEffect(() => {
    if (focussable && refFocus.current) {
      refFocus.current.focus();
    }
  }, [focussable]);

  // currently there is not really an accepted practice with regards on how to dismiss alerts
  // see https://github.com/w3c/aria-practices/issues/663
  // the role alertdialog can be used but this requires the use of a modal and containing focus to be accessible
  // see https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/
  return (
    <div
      ref={refFocus}
      tabIndex={-1}
      className={classes}
      data-testid="alert"
      {...props}
      role="alert"
    >
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
