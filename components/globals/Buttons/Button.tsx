import React, { ReactElement } from "react";
import { themes, Theme } from "./themes";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactElement;
  className?: string;
  iconWrapperClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
  theme?: Theme;
  tabIndex?: number;
  buttonRef?: (el: HTMLButtonElement) => void;
  dataTestId?: string;
  shape?: "rectangle" | "circle";
}

export const Button = ({
  type = "button",
  children,
  onClick,
  className,
  id,
  icon,
  iconWrapperClassName,
  disabled = false,
  "aria-label": ariaLabel = undefined,
  theme = "primary",
  tabIndex = 0,
  buttonRef,
  dataTestId,
  shape = "rectangle",
  ...rest
}: ButtonProps & JSX.IntrinsicElements["button"]) => {
  const baseTheme = shape === "circle" ? themes["baseCircle"] : themes["base"];
  return (
    <button
      onClick={onClick}
      className={`${className || ""} ${themes[theme]} ${baseTheme}`}
      id={id}
      disabled={disabled}
      aria-label={ariaLabel}
      type={type}
      tabIndex={tabIndex}
      ref={buttonRef}
      data-testid={dataTestId}
      {...rest}
    >
      {icon && (
        <div
          className={`${iconWrapperClassName || ""} ${theme === "icon" ? "" : "-ml-2 mr-2 w-8"}`}
        >
          {icon}
        </div>
      )}
      {children}
    </button>
  );
};
