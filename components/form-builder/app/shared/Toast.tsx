import React from "react";
import {
  ToastContainer as OriginalContainer,
  toast as originalToast,
  Bounce,
  Slide,
  TypeOptions,
  ToastPosition,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";
// import "react-toastify/dist/ReactToastify.minimal.css";

const contextClass = {
  success: "bg-green-50",
  error: "bg-red-100",
  info: "bg-blue-50",
  warning: "bg-yellow-50",
  default: "bg-white",
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
          contextClass[context?.type || "default"]
        } relative flex drop-shadow-md p-1 min-h-10 rounded-md justify-between overflow-hidden cursor-pointer`;
      }}
      bodyClassName="flex p-4 text-base text-black"
      position={originalToast.POSITION.TOP_CENTER}
      autoClose={3000}
      hideProgressBar={true}
      closeOnClick={true}
      transition={Bounce}
    />
  );
};

export const toast = {
  success: (message: string) => {
    originalToast.success(message);
  },
  error: (message: string) => {
    originalToast.error(message);
  },
  info: (message: string) => {
    originalToast.info(message);
  },
  warning: (message: string) => {
    originalToast.warning(message);
  },
  default: (message: string) => {
    originalToast(message);
  },
};
