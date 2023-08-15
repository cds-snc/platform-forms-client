import { CircleCheckIcon, InfoIcon, WarningIcon } from "@components/form-builder/icons";
import { cn } from "@lib/utils";
import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export enum ErrorStatus {
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  INFO = "INFO",
}

const headingClasses = {
  h2: "text-2xl font-sans font-semibold",
  h3: "text-xl font-sans font-semibold",
  h4: "text-lg font-sans font-semibold",
};

export const Title = ({
  children,
  headingTag: HeadingTag = "h2",
  status,
  className,
}: {
  children: string;
  headingTag?: "h2" | "h3" | "h4";
  status?: ErrorStatus;
  className?: string;
}) => {
  if (typeof children !== "string") {
    return <>{children}</>;
  }
  const statusClass = status ? `${defaultClasses.text[status]}` : "";

  return (
    <HeadingTag
      data-testid="alert-heading"
      className={cn("mb-0 pb-0", headingClasses[HeadingTag], statusClass, className)}
    >
      {children}
    </HeadingTag>
  );
};

export const Body = ({
  children,
  className,
}: {
  children: JSX.Element | string;
  className?: string;
}) => {
  return (
    <div data-testid="alert-body" className={cn(className)}>
      {children}
    </div>
  );
};

export const IconWrapper = ({
  children,
  status,
  className,
}: {
  children: JSX.Element;
  status?: ErrorStatus | undefined;
  className?: string;
}) => {
  if (children.type.name === "IconWrapper") {
    return <>{children}</>;
  }
  const statusClass = status ? `${defaultClasses.icon[status]}` : "";

  return (
    <div className={cn("mr-3", statusClass, className)} data-testid="alert-icon">
      {children}
    </div>
  );
};

const defaultClasses = {
  background: {
    [ErrorStatus.SUCCESS]: "bg-emerald-50",
    [ErrorStatus.WARNING]: "bg-yellow-50",
    [ErrorStatus.ERROR]: "bg-red-50",
    [ErrorStatus.INFO]: "bg-indigo-50",
  },
  icon: {
    [ErrorStatus.SUCCESS]: "[&_svg]:fill-emerald-700",
    [ErrorStatus.WARNING]: "[&_svg]:fill-slate-950",
    [ErrorStatus.ERROR]: "[&_svg]:fill-red-700",
    [ErrorStatus.INFO]: "[&_svg]:fill-slate-950",
  },
  text: {
    [ErrorStatus.SUCCESS]: "text-emerald-700",
    [ErrorStatus.WARNING]: "text-slate-950",
    [ErrorStatus.ERROR]: "text-red-700",
    [ErrorStatus.INFO]: "text-slate-950",
  },
};

const defaultIconClasses = "h-12 w-12";

const defaultIcons = {
  [ErrorStatus.SUCCESS]: (
    <IconWrapper status={ErrorStatus.SUCCESS}>
      <CircleCheckIcon className={defaultIconClasses} />
    </IconWrapper>
  ),
  [ErrorStatus.WARNING]: (
    <IconWrapper status={ErrorStatus.WARNING}>
      <WarningIcon className={defaultIconClasses} />
    </IconWrapper>
  ),
  [ErrorStatus.ERROR]: (
    <IconWrapper status={ErrorStatus.ERROR}>
      <WarningIcon className={defaultIconClasses} />
    </IconWrapper>
  ),
  [ErrorStatus.INFO]: (
    <IconWrapper status={ErrorStatus.INFO}>
      <InfoIcon className={defaultIconClasses} />
    </IconWrapper>
  ),
};

type AlertProps = {
  children?: ReactNode | string;
  title?: string;
  body?: string;
  icon?: JSX.Element | false | undefined;
  className?: string;
  status?: ErrorStatus | undefined;
  dismissible?: boolean;
  onDismiss?: React.ReactEventHandler;
  focussable?: boolean;
  role?: string;
};

const AlertContainer = ({
  children,
  title,
  body,
  icon,
  className,
  status,
  dismissible,
  onDismiss,
  focussable,
  role = "alert",
  ...props
}: AlertProps) => {
  let alertTitle: JSX.Element | string | undefined = title;
  let alertBody: JSX.Element | string | undefined = body;
  let alertIcon: JSX.Element | false | undefined =
    status && icon == undefined ? defaultIcons[status] : icon;
  const content: JSX.Element[] = [];
  const [dismissed, setDismissed] = useState(false);
  const refFocus = useRef<HTMLDivElement>(null);

  if (dismissible && !onDismiss) {
    onDismiss = () => setDismissed(true);
  }

  const { t } = useTranslation("common");

  // Used to focus on showing. Purely for visual users, the role=alert takes care of AT users.
  useEffect(() => {
    if (focussable && refFocus.current) {
      refFocus.current.focus();
    }
  }, [focussable]);

  // Children components for title and body override props
  React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Title) {
      alertTitle = React.cloneElement(child, {
        ...child.props,
        status: status,
      });
    } else if (child.type === Body) {
      alertBody = child;
    } else if (child.type === IconWrapper) {
      alertIcon = React.cloneElement(child, {
        ...child.props,
        status: status,
      });
    } else {
      content.push(child);
    }
  });

  return !dismissed ? (
    <div
      ref={refFocus}
      {...(focussable && { tabIndex: -1 })}
      className={cn("relative flex rounded-lg p-4", className)}
      data-testid="alert"
      role={role}
      {...props}
    >
      {dismissible && (
        <button
          data-testid="alert-dismiss"
          id="dismissButton"
          aria-label={t("alert.dismissAlert")}
          className="absolute right-0 mr-4 h-10 w-10 rounded-full border border-slate-950 bg-white text-2xl text-slate-950"
          onClick={onDismiss}
        >
          x
        </button>
      )}
      {alertIcon && <IconWrapper status={status}>{alertIcon}</IconWrapper>}
      <div className={`${alertIcon && ""}`}>
        {alertTitle && <Title status={status}>{alertTitle}</Title>}
        <Body>
          <>
            {alertBody && <>{alertBody}</>}
            {content}
          </>
        </Body>
      </div>
    </div>
  ) : null;
};

export const Info = ({
  children,
  title,
  body,
  icon,
  className,
  dismissible,
  onDismiss,
  focussable,
  ...props
}: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      className={`bg-indigo-50 ${className}`}
      status={ErrorStatus.INFO}
      icon={icon}
      dismissible={dismissible}
      onDismiss={onDismiss}
      focussable={focussable}
      {...props}
    >
      {children}
    </AlertContainer>
  );
};

export const Warning = ({
  children,
  title,
  body,
  icon,
  className,
  dismissible,
  onDismiss,
  focussable,
  ...props
}: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      className={`bg-yellow-50 ${className}`}
      status={ErrorStatus.WARNING}
      icon={icon}
      dismissible={dismissible}
      onDismiss={onDismiss}
      focussable={focussable}
      {...props}
    >
      {children}
    </AlertContainer>
  );
};

export const Danger = ({
  children,
  title,
  body,
  icon,
  className,
  dismissible,
  onDismiss,
  focussable,
  ...props
}: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      className={`bg-red-50 ${className}`}
      status={ErrorStatus.ERROR}
      icon={icon}
      dismissible={dismissible}
      onDismiss={onDismiss}
      focussable={focussable}
      {...props}
    >
      {children}
    </AlertContainer>
  );
};

export const Success = ({
  children,
  title,
  body,
  icon,
  className,
  dismissible,
  onDismiss,
  focussable,
  ...props
}: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      className={`bg-emerald-50 ${className}`}
      status={ErrorStatus.SUCCESS}
      icon={icon}
      dismissible={dismissible}
      onDismiss={onDismiss}
      focussable={focussable}
      {...props}
    >
      {children}
    </AlertContainer>
  );
};

export const Alert = {
  Info,
  Warning,
  Danger,
  Success,
};
