"use client";
import React, { ReactElement, type JSX } from "react";
import { themes, Theme } from "./themes";
import { cn } from "@lib/utils";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";
import { useTranslation } from "@i18n/client";

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
  loading?: boolean;
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
  tabIndex, // Note: a button should already be in the tab-index rotor. Only add for specific cases.
  buttonRef,
  dataTestId,
  loading = false,
  ...rest
}: ButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { t } = useTranslation("common");

  const disabledGreyClass = `
    focus:bg-[#e2e8ef] focus:text-[#748094] focus:border-none focus:outline-offset-0 focus:outline-0
    active:bg-[#e2e8ef] active:text-[#748094] active:border-none active:outline-offset-0 active:outline-0
  `;

  return (
    <button
      type={type}
      onClick={onClick}
      className={
        loading
          ? cn(themes["base"], themes.disabled, disabledGreyClass)
          : cn(themes["base"], themes[theme], className)
      }
      disabled={disabled}
      aria-label={ariaLabel}
      {...(tabIndex && { tabIndex })}
      ref={buttonRef}
      data-testid={dataTestId}
      {...rest}
    >
      {icon && <div className={cn(theme !== "icon" && "-ml-2 mr-2 w-8")}>{icon}</div>}
      {children}

      {loading && (
        <SpinnerIcon className="ml-2 size-7 animate-spin fill-blue-600 text-white dark:text-white" />
      )}
      <div aria-live="polite" className="sr-only">
        {loading && `${t("loadingResult")}`}
      </div>
    </button>
  );
};

export const RoundedButton = ({ className, ...props }: ButtonProps) => (
  <Button {...props} className={cn(className, "rounded-[100px]")} />
);
