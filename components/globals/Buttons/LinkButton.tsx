import React from "react";
import { StyledLink } from "@components/globals/";
import { themes } from "@components/globals";
import { shapes } from "./themes";

type LinkButtonProps = {
  href: string;
  children: JSX.Element | string;
  className?: string;
  shape?: "rectangle" | "circle";
};

export const Primary = ({ href, children, className, shape }: LinkButtonProps) => {
  const shapeClass = shape === "circle" ? shapes.circle : shapes.rectangle;
  return (
    <StyledLink
      href={href}
      className={`${themes.primary} ${themes.base} ${themes.htmlLink} ${className} ${shapeClass}`}
    >
      {children}
    </StyledLink>
  );
};

export const Secondary = ({ href, className, children, shape }: LinkButtonProps) => {
  const shapeClass = shape === "circle" ? shapes.circle : shapes.rectangle;
  return (
    <StyledLink
      href={href}
      className={`text-black-default active:text-black-default visited:text-black-default ${themes.secondary} ${themes.base} no-underline active:shadow-none focus:shadow-none ${className} ${shapeClass}`}
    >
      {children}
    </StyledLink>
  );
};

export const LinkButton = {
  Primary,
  Secondary,
};
