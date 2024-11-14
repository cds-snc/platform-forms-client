import { cn } from "@lib/utils";
import React, { ReactNode } from "react";

type HealthCheckBoxProps = {
  title?: string;
  children?: ReactNode | string;
  className?: string;
};

export const Container = ({
  className,
  children,
}: {
  className: string;
  children: HealthCheckBoxProps["children"];
}) => {
  return (
    <div className={cn("border-1 min-w-80 max-w-96 py-4 px-6 mb-10", className)}>{children}</div>
  );
};

export const Success = ({ children, title }: HealthCheckBoxProps) => {
  return (
    <Container className="border-emerald-500 bg-emerald-50 text-emerald-700">
      {children}
      <h4>{title}</h4>
    </Container>
  );
};

export const Danger = ({ children, title }: HealthCheckBoxProps) => {
  return (
    <Container className="border-red-500 bg-red-50 text-red-700">
      {children}
      <h4>{title}</h4>
    </Container>
  );
};

export const Warning = ({ children, title }: HealthCheckBoxProps) => {
  return (
    <Container className="border-yellow-500 bg-yellow-50 text-yellow-700">
      {children}
      <h4>{title}</h4>
    </Container>
  );
};

export const HealthCheckBox = {
  Success,
  Danger,
  Warning,
};
