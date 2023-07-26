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
}: {
  children: string;
  level?: "h2" | "h3" | "h4";
}) => {
  if (typeof children !== "string") {
    return <>{children}</>;
  }
  const Wrapper = `${level}` as keyof JSX.IntrinsicElements;

  return <Wrapper>{children}</Wrapper>;
};

export const Body = ({ children }: { children: JSX.Element | string }) => {
  return <>{children}</>;
};

export const Icon = ({ children }: { children: JSX.Element }) => {
  if (children.type.name === "Icon") {
    return <>{children}</>;
  }
  return <div className="mr-1">{children}</div>;
};

const classes = {
  background: {
    [ErrorStatus.SUCCESS]: "bg-emerald-50",
    [ErrorStatus.WARNING]: "bg-yellow-50",
    [ErrorStatus.ERROR]: "bg-red-50",
    [ErrorStatus.INFO]: "bg-indigo-50",
  },
  icon: {
    [ErrorStatus.SUCCESS]: "fill-emerald-700",
    [ErrorStatus.WARNING]: "fill-yellow-700",
    [ErrorStatus.ERROR]: "fill-red-700",
    [ErrorStatus.INFO]: "fill-indigo-700",
  },
  text: {
    [ErrorStatus.SUCCESS]: "text-emerald-700",
    [ErrorStatus.WARNING]: "text-yellow-700",
    [ErrorStatus.ERROR]: "text-red-700",
    [ErrorStatus.INFO]: "text-indigo-700",
  },
};

type AlertProps = {
  children?: ReactNode | string;
  title?: string;
  body?: string;
  classNames?: string;
  type?: ErrorStatus;
};

const AlertContainer = ({ children, title, body, classNames, type }: AlertProps) => {
  let alertTitle: JSX.Element | string | undefined = title;
  let alertBody: JSX.Element | string | undefined = body;
  let alertIcon;
  const content: JSX.Element[] = [];

  // Children components for title and body override props
  React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Title) {
      alertTitle = child;
    } else if (child.type === Body) {
      alertBody = child;
    } else if (child.type === Icon) {
      // alertIcon = child;
      alertIcon = React.cloneElement(child, {
        ...child.props,
        className: `${child.props.className} ${type && classes.icon[type]}`,
      });
    } else {
      content.push(child);
    }
  });

  return (
    <div className={`relative flex rounded-lg p-4 ${classNames}`} data-testid="alert" role="alert">
      {alertIcon && <Icon>{alertIcon}</Icon>}
      <div className={`${alertIcon && "mt-2"}`}>
        {alertTitle && <Title>{alertTitle}</Title>}
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

export const Info = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-indigo-50" type={ErrorStatus.INFO}>
      {children}
    </AlertContainer>
  );
};

export const Warning = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-yellow-50" type={ErrorStatus.WARNING}>
      {children}
    </AlertContainer>
  );
};

export const Danger = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-red-50" type={ErrorStatus.ERROR}>
      {children}
    </AlertContainer>
  );
};

export const Success = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-emerald-50" type={ErrorStatus.SUCCESS}>
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
