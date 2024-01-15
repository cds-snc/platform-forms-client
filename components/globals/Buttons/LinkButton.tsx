import React from "react";
import { StyledLink } from "@components/globals/";
import { themes } from "@components/globals";
import { cn } from "@lib/utils";
import { Tooltip } from "../../form-builder/app/shared/Tooltip";

type LinkButtonProps = {
  href: string;
  children: JSX.Element | string;
  className?: string;
  scroll?: boolean;
  title?: string;
  onClick?: () => void;
  isActive?: boolean;
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

export const LeftNav = ({ href, children, title = "", onClick, isActive }: LinkButtonProps) => {
  const classes =
    "border-box flex h-[60px] w-[60px] items-center justify-center text-black-default no-underline visited:text-black-default hover:border-indigo-700 hover:fill-indigo-700 focus:border-indigo-700 focus:bg-white focus:fill-indigo-700 focus:text-white-default focus:shadow-none focus:outline focus:outline-[0px] focus:outline-offset-0 focus:outline-indigo-700 active:top-0.5 active:bg-indigo-700 active:fill-white active:text-white active:shadow-none active:outline-[0px] active:outline-indigo-700 disabled:cursor-not-allowed disabled:!border-none disabled:bg-gray-light disabled:text-gray-dark hover:border-1";
  return (
    <div className="relative flex h-[60px] w-[60px]">
      <Tooltip text={title} side="right">
        <StyledLink
          {...(isActive && { "aria-current": "page" })}
          href={href}
          onClick={onClick ? () => onClick() : undefined}
          className={cn(
            classes,
            isActive && "bg-indigo-700 !fill-white shadow-none outline-[0px] outline-indigo-700"
          )}
        >
          {children}
        </StyledLink>
      </Tooltip>
    </div>
  );
};

export const LinkButton = {
  Primary,
  Secondary,
  LeftNav,
};
