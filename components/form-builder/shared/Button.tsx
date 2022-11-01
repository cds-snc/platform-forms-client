import React, { ReactElement } from "react";

export const Button = ({
  children,
  onClick,
  className,
  id,
  icon,
  disabled = false,
  "aria-label": ariaLabel = undefined,
  theme = "primary",
}: {
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactElement;
  className?: string;
  disabled?: boolean;
  "aria-label"?: string;
  theme?: "primary" | "secondary" | "destructive";
}) => {
  const themes = {
    primary:
      "bg-blue-dark text-white-default border-black-default hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active",
    secondary:
      "bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500",
    destructive:
      "bg-red-default text-white-default border-red-default hover:bg-red-destructive hover:border-red-destructive active:bg-red-hover focus:border-blue-hover",
  };

  return (
    <button
      onClick={onClick}
      className={`${className || ""} ${
        themes[theme]
      } relative py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default`}
      id={id}
      disabled={disabled}
      aria-label={ariaLabel}
      type="button"
    >
      {icon && <div className="w-8 -ml-2 mr-2">{icon}</div>}
      {children}
    </button>
  );
};
