import { cn } from "@lib/utils";
import Link from "next/link";
import type { JSX } from "react";

export const themes = {
  base: "inline-flex items-center rounded-lg border-2 border-solid px-5 py-2 focus:border-blue-active focus:bg-blue-focus focus:text-white-default focus:outline focus:outline-[3px] focus:outline-offset-2 focus:outline-blue-focus active:top-0.5 active:bg-blue-active active:text-white-default active:outline-[3px] active:outline-offset-2 active:outline-blue-focus disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light disabled:text-gray-dark",
  htmlLink: "no-underline visited:text-white-default",
  primary:
    "border-blue bg-blue-default text-white-default hover:border-blue-light hover:bg-blue-light hover:text-white-default",
  secondary:
    "border-gcds-blue-800 bg-white-default text-gcds-blue-800 visited:text-gcds-blue-800 hover:bg-gcds-blue-100 hover:text-gcds-blue-800 active:border-black",
  destructive:
    "border-red-destructive bg-red-destructive text-white-default hover:border-red-hover hover:bg-red-hover",
  link: "!border-none bg-transparent !p-0 text-blue-default underline hover:no-underline focus:!text-white-default",
  icon: "ml-1.5 max-h-9 !rounded-full !border-none bg-gray-selected !p-1.5 hover:bg-gray-600",
} as const;

export type Theme = keyof typeof themes;

type LinkButtonProps = {
  href: string;
  children: JSX.Element | string;
  className?: string;
  scroll?: boolean;
  title?: string;
  onClick?: () => void;
  isActive?: boolean;
  testid?: string;
  target?: string;
};

export const Default = ({ href, children, className, scroll }: LinkButtonProps) => {
  return (
    <Link scroll={scroll} href={href} className={cn(themes.link, className)}>
      {children}
    </Link>
  );
};

export const Primary = ({ href, children, className, scroll, target }: LinkButtonProps) => {
  return (
    <Link
      scroll={scroll}
      href={href}
      className={cn(themes.primary, themes.base, themes.htmlLink, className)}
      target={target}
    >
      {children}
    </Link>
  );
};

export const Secondary = ({ href, className, children, scroll }: LinkButtonProps) => {
  return (
    <Link
      scroll={scroll}
      href={href}
      className={cn(
        "text-black-default visited:text-black-default active:text-black-default no-underline",
        themes.secondary,
        themes.base,
        className
      )}
    >
      {children}
    </Link>
  );
};

export const LinkButton = {
  Primary,
  Secondary,
};

export default Default;
