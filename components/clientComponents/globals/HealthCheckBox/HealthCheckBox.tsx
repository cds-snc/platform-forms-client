import { cn } from "@lib/utils";
import React, { ReactNode } from "react";
import { defaultIcons, ErrorStatus } from "../Alert/Alert";
import { Trans } from "react-i18next";

type HealthCheckBoxProps = {
  titleKey?: string;
  children?: ReactNode | string;
  className?: string;
  count?: number;
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

const Icon = ({ type }: { type: keyof typeof ErrorStatus }) => {
  return (
    <div className="mb-2">
      <div>{defaultIcons[type]}</div>
    </div>
  );
};

const NumberCount = ({ count }: { count: number }) => {
  return (
    <div className="mb-2">
      <div className="mt-2 flex items-center justify-center text-4xl font-bold">{count}</div>
    </div>
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
      <div className="grid justify-items-center gap-1">{children}</div>
    </div>
  );
};

export const Success = ({ children, titleKey, count }: HealthCheckBoxProps) => {
  return (
    <BoxContainer className="border-emerald-500 bg-emerald-50 text-emerald-700">
      {count ? <NumberCount count={count} /> : <Icon type={ErrorStatus.SUCCESS} />}
      <div className="flex flex-col items-center justify-center">
        {titleKey && <Title i18nKey={titleKey} />}
        <div className="text-blue-dark">{children}</div>
      </div>
    </BoxContainer>
  );
};

export const Danger = ({ children, titleKey, count }: HealthCheckBoxProps) => {
  return (
    <BoxContainer className="border-red-500 bg-red-50 text-red-700">
      {count ? <NumberCount count={count} /> : <Icon type={ErrorStatus.ERROR} />}
      <div className="flex flex-col items-center justify-center">
        {titleKey && <Title i18nKey={titleKey} />}
        <div className="text-blue-dark">{children}</div>
      </div>
    </BoxContainer>
  );
};

export const Warning = ({ children, titleKey, count }: HealthCheckBoxProps) => {
  return (
    <BoxContainer className="border-yellow-500 bg-yellow-50 text-yellow-700">
      {count ? <NumberCount count={count} /> : <Icon type={ErrorStatus.WARNING} />}
      <div className="flex flex-col items-center justify-center">
        {titleKey && <Title i18nKey={titleKey} />}
        <div className="text-blue-dark">{children}</div>
      </div>
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
