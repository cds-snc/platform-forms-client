import React from "react";
import { StyledLink } from "@appComponents/globals/StyledLink/StyledLink";
import { themes } from "@appComponents/globals/Buttons/themes";

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
      className={`${themes.primary} ${themes.base} ${themes.htmlLink} ${className}`}
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
