"use client";
import React, { ReactElement, type JSX } from "react";
import { themes, Theme } from "./themes";
import { cn } from "@lib/utils";
import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";
import { useTranslation } from "@i18n/client";
import { useFormStatus } from "react-dom";

// Convenience for server actions
export const SubmitButtonAction = (props: ButtonProps) => {
  const { pending } = useFormStatus();
  return <SubmitButton loading={pending} {...props} />;
};

/**
 * Adds an accessible submit button that has a spinner when loading.
 *
 * Note:
 * The difference between this and the "standard" Button is this does not disable the submit button
 * when loading. The main reason for this is that it is confusing for AT users to have a button
 * that changes suddenly to be out of the tab order (not focussable or activateable). Instead this
 * button gives a visual and AT accessible indication that it is loading. The button also
 * programmatically disables a form submit while loading just like a disabled button would.
 *
 * Here's a helpful article on the topic:
 * https://adrianroselli.com/2024/02/dont-disable-form-controls.html
 *
 * Note about above Note:
 * I think it is weird that AT do not do more with an html buttons DOM state switching to disabled
 * or with aria-disabled but this is what we have to work with.
 */

interface ButtonProps {
  children?: JSX.Element | string;
  id?: string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  icon?: ReactElement;
  className?: string;
  theme?: Theme;
  buttonRef?: (el: HTMLButtonElement) => void;
  dataTestId?: string;
  describeLoading?: string;
  type?: "submit" | "button";
}

interface SubmitButtonProps extends ButtonProps {
  loading: boolean;
}

export const SubmitButton = ({
  children,
  onClick,
  className,
  icon,
  theme = "primary",
  buttonRef,
  dataTestId,
  loading,
  describeLoading,
  type = "submit",
  ...rest
}: SubmitButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const { t } = useTranslation("common");
  const disabledClass = `
    focus:bg-[#e2e8ef] focus:text-[#748094] focus:border-none focus:outline-offset-0 focus:outline-0
    active:bg-[#e2e8ef] active:text-[#748094] active:border-none active:outline-offset-0 active:outline-0
  `;

  return (
    <button
      // "type" because a "submit" button may no longer be in a form element with the new server action patterns
      type={type}
      // Note: no need to add onKeyDown also, keying enter also triggers onClick. More info see
      // https://html.spec.whatwg.org/#implicit-submission
      onClick={(e) => {
        if (!loading && onClick) {
          onClick(e);
        } else if (loading) {
          // Prevent form submit while loading in the case of a user keying a submit in a form.
          // This is needed since the onClick is also called for a form submit.
          e.preventDefault();
        }
      }}
      className={
        loading
          ? cn(themes["base"], themes.disabled, disabledClass, className)
          : cn(themes["base"], themes[theme], className)
      }
      ref={buttonRef}
      data-testid={dataTestId}
      // TODO do more testing on aria-disabled, doesn't seem to do much with AT... worth even
      // using with a submit button?
      aria-disabled={loading}
      {...rest}
    >
      {icon && <div className={cn(theme !== "icon" && "-ml-2 mr-2 w-8")}>{icon}</div>}
      {children}
      {loading && (
        <SpinnerIcon className="ml-2 size-7 animate-spin fill-blue-600 text-white dark:text-white" />
      )}
      <div aria-live="polite" className="sr-only">
        {loading && `${describeLoading ? describeLoading : t("loadingResult")}`}
      </div>
    </button>
  );
};
