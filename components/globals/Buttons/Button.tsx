import React, { ReactElement } from "react";
import { themes, Theme } from "./themes";
import { cn } from "@lib/utils";

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactElement;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  theme?: Theme;
  tabIndex?: number;
  buttonRef?: (el: HTMLButtonElement) => void;
  dataTestId?: string;
}

export const Button = ({
  type = "button",
  children,
  onClick,
  className,
  icon,
  disabled = false,
  "aria-label": ariaLabel = undefined,
  theme = "primary",
  tabIndex = 0,
  buttonRef,
  dataTestId,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(themes["base"], themes[theme], className)}
      disabled={disabled}
      aria-label={ariaLabel}
      tabIndex={tabIndex}
      ref={buttonRef}
      data-testid={dataTestId}
      {...rest}
    >
      {icon && <div className={cn(theme !== "icon" && "-ml-2 mr-2 w-8")}>{icon}</div>}
      {children}
    </button>
  );
};

export const RoundedButton = ({ className, ...props }: ButtonProps) => (
  <Button {...props} className={cn(className, "rounded-[100px]")} />
);
