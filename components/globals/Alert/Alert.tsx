import { CircleCheckIcon, InfoIcon, WarningIcon } from "@components/form-builder/icons";
import React, { ReactNode } from "react";

export enum ErrorStatus {
  SUCCESS = "SUCCESS",
  WARNING = "WARNING",
  ERROR = "ERROR",
  INFO = "INFO",
}

export const Title = ({
  children,
  level = "h2",
  status,
}: {
  children: string;
  level?: "h2" | "h3" | "h4";
  status?: ErrorStatus;
}) => {
  if (typeof children !== "string") {
    return <>{children}</>;
  }
  const Wrapper = `${level}` as keyof JSX.IntrinsicElements;
  const className = status ? `${defaultClasses.text[status]}` : "";

  return <Wrapper className={`${className}`}>{children}</Wrapper>;
};

export const Body = ({ children }: { children: JSX.Element | string }) => {
  return <>{children}</>;
};

export const Icon = ({
  children,
  status,
}: {
  children: JSX.Element;
  status?: ErrorStatus | undefined;
}) => {
  if (children.type.name === "Icon") {
    return <>{children}</>;
  }
  const className = status ? `${defaultClasses.icon[status]}` : "";

  return <div className={`mr-1 ${className}`}>{children}</div>;
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
    [ErrorStatus.WARNING]: "text-yellow-700",
    [ErrorStatus.ERROR]: "text-red-700",
    [ErrorStatus.INFO]: "text-indigo-700",
  },
};

const defaultIcons = {
  [ErrorStatus.SUCCESS]: (
    <Icon status={ErrorStatus.SUCCESS}>
      <CircleCheckIcon className={`h-12 w-12`} />
    </Icon>
  ),
  [ErrorStatus.WARNING]: (
    <Icon status={ErrorStatus.WARNING}>
      <WarningIcon className={`h-12 w-12`} />
    </Icon>
  ),
  [ErrorStatus.ERROR]: (
    <Icon status={ErrorStatus.ERROR}>
      <WarningIcon className={`h-12 w-12`} />
    </Icon>
  ),
  [ErrorStatus.INFO]: (
    <Icon status={ErrorStatus.INFO}>
      <InfoIcon className={`h-12 w-12`} />
    </Icon>
  ),
};

type AlertProps = {
  children?: ReactNode | string;
  title?: string;
  body?: string;
  icon?: JSX.Element | false | undefined;
  classNames?: string;
  status?: ErrorStatus | undefined;
  dismissible?: boolean;
  onDismiss?: React.ReactEventHandler;
  focussable?: boolean;
};

const AlertContainer = ({ children, title, body, icon, classNames, status }: AlertProps) => {
  let alertTitle: JSX.Element | string | undefined = title;
  let alertBody: JSX.Element | string | undefined = body;
  let alertIcon: JSX.Element | false | undefined =
    status && icon == undefined ? defaultIcons[status] : icon;
  const content: JSX.Element[] = [];

  // @TODO: handle dismissable alerts
  // @TODO: handle arbitrary props (...props)
  // @TODO: handle focusable alerts

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
    } else if (child.type === Icon) {
      alertIcon = React.cloneElement(child, {
        ...child.props,
        status: status,
      });
    } else {
      content.push(child);
    }
  });

  return (
    <div className={`relative flex rounded-lg p-4 ${classNames}`} data-testid="alert" role="alert">
      {alertIcon && <Icon status={status}>{alertIcon}</Icon>}
      <div className={`${alertIcon && "mt-2"}`}>
        {alertTitle && <Title status={status}>{alertTitle}</Title>}
        <Body>
          <>
            {alertBody && <>{alertBody}</>}
            {content}
          </>
        </Body>
      </div>
    </div>
  );
};

export const Info = ({ children, title, body, icon, classNames }: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      classNames={`bg-indigo-50 ${classNames}`}
      status={ErrorStatus.INFO}
      icon={icon}
    >
      {children}
    </AlertContainer>
  );
};

export const Warning = ({ children, title, body, icon, classNames }: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      classNames={`bg-yellow-50 ${classNames}`}
      status={ErrorStatus.WARNING}
      icon={icon}
    >
      {children}
    </AlertContainer>
  );
};

export const Danger = ({ children, title, body, icon, classNames }: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      classNames={`bg-red-50 ${classNames}`}
      status={ErrorStatus.ERROR}
      icon={icon}
    >
      {children}
    </AlertContainer>
  );
};

export const Success = ({ children, title, body, icon, classNames }: AlertProps) => {
  return (
    <AlertContainer
      title={title}
      body={body}
      classNames={`bg-emerald-50 ${classNames}`}
      status={ErrorStatus.SUCCESS}
      icon={icon}
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
