import React from "react";
import { StyledLink } from "@components/globals/";
import { themes } from "@components/globals";

type LinkButtonProps = {
  href: string;
  children: JSX.Element | string;
  className?: string;
};

export const Primary = ({ href, children, className }: LinkButtonProps) => {
  return (
    <StyledLink
      href={href}
      className={`${themes.primary} ${themes.base} ${themes.htmlLink} ${className}`}
    >
      {children}
    </StyledLink>
  );
};

export const Secondary = ({ href, className, children }: LinkButtonProps) => {
  return (
    <StyledLink
      href={href}
      className={`text-black-default active:text-black-default visited:text-black-default ${themes.secondary} ${themes.base} no-underline active:shadow-none focus:shadow-none ${className}`}
    >
      {children}
    </StyledLink>
  );
};

export const LinkButton = {
  Primary,
  Secondary,
};
