"use client";
import React, { ReactElement } from "react";
import { themes, Theme } from "./themes";
import { cn } from "@lib/utils";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";

/**
 * TODO add to auth related pages like 2FA
 * TODO note why disabling a submit button is confusing for AT users
 * TODO add active focus hover state for button
 * TODO look into aria-disabled
 */

interface ButtonSubmitProps {
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactElement;
  className?: string;
  "aria-label"?: string;
  theme?: Theme;
  buttonRef?: (el: HTMLButtonElement) => void;
  dataTestId?: string;
  loading: boolean;
  describeLoading?: string;
}

export const ButtonSubmit = ({
  children,
  onClick,
  onKeyDown,
  className,
  icon,
  "aria-label": ariaLabel = undefined,
  theme = "primary",
  buttonRef,
  dataTestId,
  loading,
  describeLoading,
  ...rest
}: ButtonSubmitProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (!loading && onClick) {
          onClick(e);
        }
      }}
      onKeyDown={(e) => {
        if (!loading && onClick && e.key === "Enter") {
          e.preventDefault(); // Stops browser from also calling on click
          onKeyDown ? onKeyDown(e) : onClick(e);
        }
      }}
      className={
        loading
          ? cn(themes["base"], themes.disabled, className)
          : cn(themes["base"], themes[theme], className)
      }
      aria-label={ariaLabel}
      ref={buttonRef}
      data-testid={dataTestId}
      // TODO do more testing on aria-disabled, doesn't seem to do much with AT...
      aria-disabled={loading}
      {...rest}
    >
      {icon && <div className={cn(theme !== "icon" && "-ml-2 mr-2 w-8")}>{icon}</div>}
      {children}
      {loading && (
        <SpinnerIcon className="ml-2 h-7 w-7 animate-spin fill-blue-600 text-white dark:text-white" />
      )}
      <div aria-live="polite" className="sr-only">
        {loading && `${describeLoading ? describeLoading : "Loading"}`}
      </div>
    </button>
  );
};

export const RoundedButtonSubmit = ({ className, ...props }: ButtonSubmitProps) => (
  <ButtonSubmit {...props} className={cn(className, "rounded-[100px]")} />
);
