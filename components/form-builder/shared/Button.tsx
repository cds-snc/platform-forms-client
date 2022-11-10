import React, { ReactElement, useState } from "react";
import PropTypes from "prop-types";

export const themes = {
  base: "relative py-2 px-5 rounded-lg border-2 border-solid inline-flex items-center active:top-0.5 focus:outline-[3px] focus:outline-blue-focus focus:outline focus:outline-offset-2 focus:bg-blue-focus focus:text-white-default disabled:cursor-not-allowed disabled:text-gray-500",
  htmlLink: "visited:text-white-default no-underline active:shadow-none focus:shadow-none",
  primary:
    "bg-blue-dark text-white-default border-black-default hover:text-white-default hover:bg-blue-light active:text-white-default active:bg-blue-active",
  secondary:
    "bg-white-default text-black-default border-black-default hover:text-white-default hover:bg-gray-600 active:text-white-default active:bg-gray-500",
  destructive:
    "bg-red-default text-white-default border-red-default hover:bg-red-destructive hover:border-red-destructive active:bg-red-hover focus:border-blue-hover",
  link: "bg-white-default !p-0 !border-none text-black-default underline hover:no-underline focus:!bg-white-default focus:!text-black-default",
  icon: "!border-none bg-gray-selected hover:bg-gray-600 !rounded-full max-h-9 !p-1.5 ml-1.5",
};

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
}) => (
  <button
    onClick={onClick}
    className={`${className || ""} ${themes[theme]} ${themes["base"]}`}
    id={id}
    disabled={disabled}
    aria-label={ariaLabel}
    type="button"
  >
    {icon && (
      <div className={`${iconWrapperClassName || ""} ${theme === "icon" ? "" : "w-8 -ml-2 mr-2"}`}>
        {icon}
      </div>
    )}
    {children}
  </button>
);

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type CallBack = (...args: any[]) => void;

const callAll =
  (...fns: Array<CallBack | undefined>) =>
  (
    ...args: any[] // eslint-disable-line  @typescript-eslint/no-explicit-any
  ) =>
    fns.forEach((fn) => typeof fn === "function" && fn(...args));

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: string;
}

export const withMessage = (
  Button: any, // eslint-disable-line  @typescript-eslint/no-explicit-any
  message?: string
) => {
  const ButtonWithMessage: React.FC<ButtonProps> = ({ onClick, ...restProps }) => {
    const [isCopied, setIsCopied] = useState("");
    const [showMessage, setShowMessage] = useState(false);

    const successMessage = () => {
      setIsCopied(message || "default");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 1500);
    };

    /**
     * Create a new button component, add the "successMessage" function call after the original onClick function
     * @returns a Button with a successMessage after their onClick
     */
    const NewButton = () => {
      return React.createElement(Button, {
        ...restProps,
        onClick: callAll(onClick, successMessage),
      });
    };

    return (
      <>
        <NewButton />
        <div className="inline" id="button-message" role="alert" aria-live="polite">
          {isCopied && (
            <span
              className={`bg-green-light text-green-darker ml-4 transition-opacity ease-in-out duration-300 inline-block py-1 px-3 ${
                showMessage ? "" : "opacity-0"
              }`}
            >
              {isCopied}
            </span>
          )}
        </div>
      </>
    );
  };

  ButtonWithMessage.displayName = "ButtonWithMessage";
  ButtonWithMessage.propTypes = {
    onClick: PropTypes.func,
  };
  return ButtonWithMessage;
};
