import React from "react";
import { StyledLink } from "@components/globals/";
import { themes } from "@components/globals";
import { cn } from "@lib/utils";

type LinkButtonProps = {
  href: string;
  children: JSX.Element | string;
  className?: string;
  scroll?: boolean;
};

export const Primary = ({ href, children, className, scroll }: LinkButtonProps) => {
  return (
    <StyledLink
      scroll={scroll}
      href={href}
      className={cn(themes.primary, themes.base, themes.htmlLink, className)}
    >
      {children}
    </StyledLink>
  );
};

export const Secondary = ({ href, className, children, scroll }: LinkButtonProps) => {
  return (
    <StyledLink
      scroll={scroll}
      href={href}
      className={cn(
        "text-black-default visited:text-black-default active:text-black-default no-underline focus:shadow-none active:shadow-none",
        themes.secondary,
        themes.base,
        className
      )}
    >
      {children}
    </StyledLink>
  );
};

export const LeftNav = ({ href, children }: LinkButtonProps) => {
  return (
    <StyledLink
      href={href}
      className="inline-flex h-[60px] w-[60px] items-center justify-center border-2 border-white text-black-default  no-underline visited:text-black-default hover:border-indigo-700 hover:fill-indigo-700 focus:border-indigo-700 focus:bg-white focus:fill-indigo-700 focus:text-white-default  focus:shadow-none focus:outline focus:outline-[0px] focus:outline-offset-0 focus:outline-indigo-700 active:top-0.5
        active:bg-indigo-700 active:fill-white active:text-white  active:shadow-none active:outline-[0px] active:outline-indigo-700 disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light
        disabled:text-gray-dark"
    >
      {children}
    </StyledLink>
  );
};

export const LinkButton = {
  Primary,
  Secondary,
  LeftNav,
};
