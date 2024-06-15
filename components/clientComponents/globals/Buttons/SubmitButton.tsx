"use client";
import React, { ReactElement } from "react";
import { themes, Theme } from "./themes";
import { cn } from "@lib/utils";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";

/**
 * TODO add to auth related pages like 2FA
 * TODO note why disabling a submit button is confusing for AT users e.g. https://adrianroselli.com/2024/02/dont-disable-form-controls.html
 * TODO add active active hover state for button
 * TODO look into aria-disabled
 */

interface SubmitButtonProps {
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactElement;
  className?: string;
  "aria-label"?: string;
  theme?: Theme;
  buttonRef?: (el: HTMLButtonElement) => void;
  dataTestId?: string;
  loading: boolean;
  describeLoading?: string;
}

export const SubmitButton = ({
  children,
  onClick,
  className,
  icon,
  "aria-label": ariaLabel = undefined,
  theme = "primary",
  buttonRef,
  dataTestId,
  loading,
  describeLoading,
  ...rest
}: SubmitButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const disabledClass = `
    focus:bg-[#e2e8ef] focus:text-[#748094] focus:border-none focus:outline-offset-0 focus:outline-0
    active:bg-[#e2e8ef] active:text-[#748094] active:border-none active:outline-offset-0 active:outline-0
  `;

  return (
    <button
      type="submit"
      // Note: no need to add onKeyDown also, keying enter also triggers onClick. More info see
      // https://html.spec.whatwg.org/#implicit-submission
      onClick={(e) => {
        // Simulate a disabled state by blocking the callback when loading
        if (!loading && onClick) {
          onClick(e);
        }
      }}
      className={
        loading
          ? cn(themes["base"], themes.disabled, disabledClass, className)
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
        // TODO run this spinner by design
        <SpinnerIcon className="ml-2 h-7 w-7 animate-spin fill-blue-600 text-white dark:text-white" />
      )}
      <div aria-live="polite" className="sr-only">
        {loading && `${describeLoading ? describeLoading : "Loading"}`}
      </div>
    </button>
  );
};

export const RoundedSubmitButton = ({ className, ...props }: SubmitButtonProps) => (
  <SubmitButton {...props} className={cn(className, "rounded-[100px]")} />
);
