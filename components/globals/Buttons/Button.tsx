import React, { ReactElement } from "react";
import { themes } from "./themes";

export const Button = ({
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
}: {
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactElement;
  className?: string;
  iconWrapperClassName?: string;
  disabled?: boolean;
  "aria-label"?: string;
  theme?: "primary" | "secondary" | "destructive" | "link" | "icon";
  tabIndex?: number;
  buttonRef?: (el: HTMLButtonElement) => void;
  dataTestId?: string;
}) => (
  <button
    onClick={onClick}
    className={`${className || ""} ${themes[theme]} ${themes["base"]}`}
    id={id}
    disabled={disabled}
    aria-label={ariaLabel}
    type="button"
    tabIndex={tabIndex}
    ref={buttonRef}
    data-testid={dataTestId}
  >
    {icon && (
      <div className={`${iconWrapperClassName || ""} ${theme === "icon" ? "" : "w-8 -ml-2 mr-2"}`}>
        {icon}
      </div>
    )}
    {children}
  </button>
);
