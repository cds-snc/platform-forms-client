import React, { ReactNode } from "react";

export const Title = ({
  children,
  level = "h2",
}: {
  children: string;
  level?: "h2" | "h3" | "h4";
}) => {
  const Wrapper = `${level}` as keyof JSX.IntrinsicElements;

  return <Wrapper>{children}</Wrapper>;
};

export const Body = ({ children }: { children: string }) => {
  return <p>{children}</p>;
};

export const Icon = ({ children }: { children: JSX.Element }) => {
  return <>{children}</>;
};

type AlertProps = {
  children?: ReactNode | string;
  title?: string;
  body?: string;
  classNames?: string;
  type?: "info" | "warning" | "danger" | "success";
};

const AlertContainer = ({ children, title, body, classNames, type }: AlertProps) => {
  let alertTitle: JSX.Element | string | undefined = title;
  let alertBody: JSX.Element | string | undefined = body;
  let alertIcon;
  const content: JSX.Element[] = [];

  // Children components for title and body override props
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === Title) {
      alertTitle = child;
    } else if (child.type === Body) {
      alertBody = child;
    } else if (child.type === Icon) {
      alertIcon = child;
    } else {
      content.push(child);
    }
  });

  return (
    <div className={`relative w-[80%] rounded-lg p-8 ${classNames}`}>
      {alertIcon && <div className="inline-block">{alertIcon}</div>}
      <div>
        {alertTitle && <>{alertTitle}</>}
        {alertBody && <>{alertBody}</>}
        {content}
      </div>
    </div>
  );
};

export const Info = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-indigo-50" type="info">
      {children}
    </AlertContainer>
  );
};

export const Warning = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-yellow-50" type="warning">
      {children}
    </AlertContainer>
  );
};

export const Danger = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-red-50" type="danger">
      {children}
    </AlertContainer>
  );
};

export const Success = ({ children, title, body }: AlertProps) => {
  return (
    <AlertContainer title={title} body={body} classNames="bg-emerald-50" type="success">
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
