"use client";
import React from "react";

export enum MessageType {
  ERROR = "ERROR",
  SUCCESS = "SUCCESS",
}

const BackgroundClasses = {
  error: "border-red bg-red-50",
  success: "border-green bg-green-50",
};

export const ValidationMessage = ({
  children,
  show,
  messageType,
}: {
  children: React.ReactNode;
  show: boolean;
  messageType: MessageType;
}) => {
  const getBackgroundClasses = (messageType: string) => {
    switch (messageType) {
      case MessageType.ERROR:
        return BackgroundClasses.error;
      case MessageType.SUCCESS:
        return BackgroundClasses.success;
      default:
        return "";
    }
  };
  return (
    <div
      role="alert"
      className={`border-l-4 p-3 ${getBackgroundClasses(messageType)} ${
        show ? "" : "visually-hidden"
      }`}
    >
      {show && <p className="text-sm font-bold">{children}</p>}
    </div>
  );
};
