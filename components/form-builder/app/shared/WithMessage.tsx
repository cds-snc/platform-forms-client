import React, { useState } from "react";
import PropTypes from "prop-types";

export const SuccessAlert = ({
  successMessage,
  showMessage,
}: {
  successMessage: string;
  showMessage: boolean;
}) => {
  return (
    <div className="inline" id="button-message" role="alert" aria-live="polite">
      {successMessage && (
        <span
          className={`transition-opacity ease-in-out duration-1000 bg-green-light ml-4 justify-center mt-2 text-green-darker inline-block py-1 px-3 ${
            showMessage ? "" : "opacity-0"
          }`}
        >
          {successMessage}
        </span>
      )}
    </div>
  );
};

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
  message?: string,
  onSuccess?: CallBack
) => {
  const ButtonWithMessage: React.FC<ButtonProps> = ({ onClick, ...restProps }) => {
    const [successMessage, setSuccessMessage] = useState("");
    const [showMessage, setShowMessage] = useState(false);

    const onFinish = () => {
      setSuccessMessage(message || "default");
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
        // 300ms after isMessage is false, remove the message string (the message span has "transition-300" class)
        setTimeout(() => setSuccessMessage(""), 300);
      }, 1500);
    };

    /**
     * Create a new button component, add the "successMessage" function call after the original onClick function
     * @returns a Button with a successMessage after their onClick
     */
    const NewButton = () => {
      return React.createElement(Button, {
        ...restProps,
        onClick: callAll(onClick, onFinish),
      });
    };

    return (
      <>
        <NewButton />
        {onSuccess
          ? showMessage && onSuccess()
          : showMessage && (
              <SuccessAlert showMessage={showMessage} successMessage={successMessage} />
            )}
      </>
    );
  };

  ButtonWithMessage.displayName = "ButtonWithMessage";
  ButtonWithMessage.propTypes = {
    onClick: PropTypes.func,
  };
  return ButtonWithMessage;
};
