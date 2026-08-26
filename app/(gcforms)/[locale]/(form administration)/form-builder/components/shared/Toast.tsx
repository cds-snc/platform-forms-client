"use client";
import { CircleCheckIcon, InfoIcon, WarningIcon } from "@serverComponents/icons";
import React, { type JSX } from "react";

// https://github.com/fkhadra/react-toastify/issues/1215#issuecomment-2674902485
import {
  ToastContainer as OriginalContainer,
  toast as originalToast,
  ToastPosition,
  Bounce,
} from "@toast/unstyled";

const contextClass = {
  success: {
    classes: "gc-toast gc-toast--success",
    icon: <CircleCheckIcon className="my-2 mr-2 size-6 fill-green-800" />,
  },
  error: {
    classes: "gc-toast gc-toast--error",
    icon: <WarningIcon className="my-2 mr-2 size-6 fill-red-800" />,
  },
  info: {
    classes: "gc-toast gc-toast--info",
    icon: <InfoIcon className="my-2 mr-2 size-6 fill-blue-600" />,
  },
  warn: {
    classes: "gc-toast gc-toast--warn",
    icon: <WarningIcon className="my-2 mr-2 size-6 fill-yellow-700" />,
  },
  warning: {
    classes: "gc-toast gc-toast--warning",
    icon: <WarningIcon className="my-2 mr-2 size-6 fill-yellow-700" />,
  },
  default: {
    classes: "gc-toast gc-toast--default",
    icon: <InfoIcon className="my-2 mr-2 size-6 fill-black" />,
  },
};

type TypeOptions = keyof typeof contextClass;

type ToastContext = {
  type?: TypeOptions;
  defaultClassName?: string;
  position?: ToastPosition;
  rtl?: boolean;
};

const widthClassNames: Record<string, string> = {
  "750px":
    "w-[750px] max-w-[calc(100vw-2rem)] [--toastify-toast-width:750px] max-md:w-[calc(100vw-2rem)] max-md:[--toastify-toast-width:calc(100vw-2rem)]",
  "600px": "w-[600px] [--toastify-toast-width:600px]",
};

export const ToastContainer = ({
  autoClose = 7000,
  width = "",
  containerId = "",
  limit,
  ariaLabel,
}: {
  autoClose?: number | false | undefined;
  width?: string;
  containerId?: string;
  limit?: number;
  ariaLabel?: string;
}) => {
  const widthClassName = widthClassNames[width] ?? "";

  return (
    <OriginalContainer
      containerId={containerId}
      toastClassName={(context?: ToastContext) => {
        const variantClassName =
          context?.defaultClassName || contextClass[context?.type || "default"]["classes"];

        return `${variantClassName}
        relative drop-shadow-md p-1 rounded-md justify-between overflow-hidden p-4 cursor-pointer text-base`;
      }}
      className={widthClassName}
      position="top-center"
      autoClose={autoClose}
      hideProgressBar={true}
      closeOnClick={true}
      transition={Bounce}
      limit={limit}
      {...(ariaLabel && { "aria-label": ariaLabel })}
      icon={() => null}
    />
  );
};

const toastIcon = (type: TypeOptions) => {
  return contextClass[type]["icon"];
};

const toastContent = (message: string | JSX.Element, type: TypeOptions) => {
  return React.isValidElement(message) ? (
    message
  ) : (
    <div className="flex flex-row px-4">
      {toastIcon(type)}
      <p className="py-2">{message}</p>
    </div>
  );
};

export const toast = {
  success: (message: string | JSX.Element, containerId = "default") => {
    originalToast.success(toastContent(message, "success"), { containerId });
  },
  error: (message: string | JSX.Element, containerId = "default") => {
    originalToast.error(toastContent(message, "error"), { containerId });
  },
  info: (message: string | JSX.Element, containerId = "default") => {
    originalToast.info(toastContent(message, "info"), { containerId });
  },
  warn: (message: string | JSX.Element, containerId = "default") => {
    originalToast.warn(toastContent(message, "warn"), { containerId });
  },
  warning: (message: string | JSX.Element, containerId = "") => {
    originalToast.warning(toastContent(message, "warning"), { containerId });
  },
  notice: (message: string | JSX.Element, containerId = "default") => {
    originalToast(message, {
      containerId,
      className: "gc-toast gc-toast--notice-warning !rounded-none !shadow-none",
    });
  },
  default: (message: string | JSX.Element, containerId = "default") => {
    originalToast(toastContent(message, "default"), { containerId });
  },
  // Dismiss toasts. If `containerId` is provided, dismiss only that container.
  dismiss: (containerId?: string) => {
    originalToast.dismiss(containerId);
  },
};
