import React, { ReactElement } from "react";
import { themes, Theme } from "./themes";

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
  dataAttrName,
  dataAttrValue,
  shape = "rectangle",
}: {
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
  dataAttrName?: string;
  dataAttrValue?: string;
  shape?: "rectangle" | "circle";
}) => {
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
      {...(dataAttrName && dataAttrValue ? { [`data-${dataAttrName}`]: dataAttrValue } : "")}
    >
      {icon && (
        <div
          className={`${iconWrapperClassName || ""} ${theme === "icon" ? "" : "w-8 -ml-2 mr-2"}`}
        >
          {icon}
        </div>
      )}
      {children}
    </button>
  );
};
