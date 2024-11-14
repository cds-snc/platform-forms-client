import { cn } from "@lib/utils";
import React, { ReactNode } from "react";
import { defaultIcons, ErrorStatus } from "../Alert/Alert";
import { Trans } from "react-i18next";

type HealthCheckBoxProps = {
  titleKey?: string;
  children?: ReactNode | string;
  className?: string;
};

const Container = ({ children }: { children: HealthCheckBoxProps["children"] }) => {
  return <div className="flex space-x-6">{children}</div>;
};

const Title = ({ i18nKey }: { i18nKey: string }) => {
  return (
    <h4 className="text-lg font-bold">
      <Text i18nKey={i18nKey} />
    </h4>
  );
};

const Text = ({ ns = "form-builder-responses", i18nKey }: { ns?: string; i18nKey: string }) => {
  return (
    <Trans
      ns={ns}
      i18nKey={i18nKey}
      defaults="<strong></strong> <a></a>"
      components={{ strong: <strong />, a: <a /> }}
    />
  );
};

export const BoxContainer = ({
  className,
  children,
}: {
  className: string;
  children: HealthCheckBoxProps["children"];
}) => {
  return (
    <div
      className={cn(
        "mb-10 grid justify-items-center  min-w-80 max-w-96 border-1 px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  );
};

export const Success = ({ children, titleKey }: HealthCheckBoxProps) => {
  return (
    <BoxContainer className="border-emerald-500 bg-emerald-50 text-emerald-700">
      <div className="mb-2">{defaultIcons[ErrorStatus.SUCCESS]}</div>
      {titleKey && <Title i18nKey={titleKey} />}
      <div className="text-blue-dark">{children}</div>
    </BoxContainer>
  );
};

export const Danger = ({ children, titleKey }: HealthCheckBoxProps) => {
  return (
    <BoxContainer className="border-red-500 bg-red-50 text-red-700">
      <div className="mb-2">{defaultIcons[ErrorStatus.ERROR]}</div>
      {titleKey && <Title i18nKey={titleKey} />}
      <div className="text-blue-dark">{children}</div>
    </BoxContainer>
  );
};

export const Warning = ({ children, titleKey }: HealthCheckBoxProps) => {
  return (
    <BoxContainer className="border-yellow-500 bg-yellow-50 text-yellow-700">
      <div className="mb-2">{defaultIcons[ErrorStatus.WARNING]}</div>
      {titleKey && <Title i18nKey={titleKey} />}
      <div className="text-blue-dark">{children}</div>
    </BoxContainer>
  );
};

export const HealthCheckBox = {
  Text,
  Container,
  Success,
  Danger,
  Warning,
};
