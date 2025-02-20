"use client";
import { CircleCheckIcon, InfoIcon, WarningIcon } from "@serverComponents/icons";
import React, { type JSX } from "react";
import {
  ToastContainer as OriginalContainer,
  toast as originalToast,
  Bounce,
  TypeOptions,
  ToastPosition,
} from "react-toastify";

const contextClass = {
  success: {
    background: "bg-green-50",
    text: "text-green-800",
    icon: <CircleCheckIcon className="size-10 fill-green-800" />,
  },
  error: {
    background: "bg-red-100",
    text: "text-red-800",
    icon: <WarningIcon className="size-10 fill-red-800" />,
  },
  info: {
    background: "bg-blue-50",
    text: "text-blue-600",
    icon: <InfoIcon className="size-10 fill-blue-600" />,
  },
  warn: {
    background: "bg-yellow-50",
    text: "text-yellow-700",
    icon: <WarningIcon className="size-10 fill-yellow-700" />,
  },
  warning: {
    background: "bg-yellow-50",
    text: "text-yellow-700",
    icon: <WarningIcon className="size-10 fill-yellow-700" />,
  },
  default: {
    background: "bg-white",
    text: "text-black",
    icon: <InfoIcon className="size-10 fill-black" />,
  },
};

type ToastContext = {
  type?: TypeOptions;
  defaultClassName?: string;
  position?: ToastPosition;
  rtl?: boolean;
};

export const ToastContainer = ({
  autoClose = 3000,
  width = "",
  containerId = "",
  limit,
}: {
  autoClose?: number | false | undefined;
  width?: string;
  containerId?: string;
  limit?: number;
}) => {
  return (
    <OriginalContainer
      containerId={containerId}
      toastClassName={(context?: ToastContext) => {
        return `${contextClass[context?.type || "default"]["background"]} 
        ${contextClass[context?.type || "default"]["text"]}
        relative drop-shadow-md p-1 rounded-md justify-between overflow-hidden p-4 cursor-pointer text-base`;
      }}
      bodyClassName={(context?: ToastContext) => {
        return `${contextClass[context?.type || "default"]["text"]} flex flex-row px-4`;
      }}
      style={{ width: width }}
      position="top-center"
      autoClose={autoClose}
      hideProgressBar={true}
      closeOnClick={true}
      transition={Bounce}
      limit={limit}
      icon={(context?: ToastContext) => {
        return contextClass[context?.type || "default"]["icon"];
      }}
    />
  );
};

const toastContent = (message: string | JSX.Element) => {
  return React.isValidElement(message) ? message : <p className="py-2">{message}</p>;
};

export const toast = {
  success: (message: string | JSX.Element, containerId = "default") => {
    originalToast.success(toastContent(message), { containerId });
  },
  error: (message: string | JSX.Element, containerId = "default") => {
    originalToast.error(toastContent(message), { containerId });
  },
  info: (message: string | JSX.Element, containerId = "default") => {
    originalToast.info(toastContent(message), { containerId });
  },
  warn: (message: string | JSX.Element, containerId = "default") => {
    originalToast.warn(toastContent(message), { containerId });
  },
  warning: (message: string | JSX.Element, containerId = "") => {
    originalToast.warning(toastContent(message), { containerId });
  },
  default: (message: string | JSX.Element, containerId = "default") => {
    originalToast(toastContent(message), { containerId });
  },
};
