import { CircleCheckIcon, InfoIcon, WarningIcon } from "@components/form-builder/icons";
import React from "react";
import {
  ToastContainer as OriginalContainer,
  toast as originalToast,
  Bounce,
  TypeOptions,
  ToastPosition,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const contextClass = {
  success: {
    background: "bg-green-50",
    text: "text-green-800",
    icon: <CircleCheckIcon className="fill-green-800" />,
  },
  error: {
    background: "bg-red-100",
    text: "text-red-800",
    icon: <WarningIcon className="fill-red-800" />,
  },
  info: {
    background: "bg-blue-50",
    text: "text-blue-600",
    icon: <InfoIcon className="fill-blue-600" />,
  },
  warn: {
    background: "bg-yellow-50",
    text: "text-yellow-700",
    icon: <WarningIcon className="fill-yellow-700" />,
  },
  warning: {
    background: "bg-yellow-50",
    text: "text-yellow-700",
    icon: <WarningIcon className="fill-yellow-700" />,
  },
  default: {
    background: "bg-white",
    text: "text-black",
    icon: <InfoIcon className="fill-black" />,
  },
};

export const ToastContainer = () => {
  return (
    <OriginalContainer
      toastClassName={(context?: {
        type?: TypeOptions;
        defaultClassName?: string;
        position?: ToastPosition;
        rtl?: boolean;
      }) => {
        return `${
          contextClass[context?.type || "default"]["background"]
        } relative flex drop-shadow-md p-1 rounded-md justify-between overflow-hidden p-4 cursor-pointer`;
      }}
      bodyClassName={(context?: {
        type?: TypeOptions;
        defaultClassName?: string;
        position?: ToastPosition;
        rtl?: boolean;
      }) => {
        return `${contextClass[context?.type || "default"]["text"]} flex text-base`;
      }}
      position={originalToast.POSITION.TOP_CENTER}
      autoClose={3000}
      hideProgressBar={true}
      closeOnClick={true}
      transition={Bounce}
      icon={(context?: {
        type?: TypeOptions;
        defaultClassName?: string;
        position?: ToastPosition;
        rtl?: boolean;
      }) => {
        return contextClass[context?.type || "default"]["icon"];
      }}
    />
  );
};

export const toast = {
  success: (message: string) => {
    originalToast.success(<p className="py-2">{message}</p>);
  },
  error: (message: string) => {
    originalToast.error(<p className="py-2">{message}</p>);
  },
  info: (message: string) => {
    originalToast.info(<p className="py-2">{message}</p>);
  },
  warn: (message: string) => {
    originalToast.warn(<p className="py-2">{message}</p>);
  },
  warning: (message: string) => {
    originalToast.warning(<p className="py-2">{message}</p>);
  },
  default: (message: string) => {
    originalToast(<p className="py-2">{message}</p>);
  },
};
