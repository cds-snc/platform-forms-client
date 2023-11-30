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

export const LinkButton = {
  Primary,
  Secondary,
};
