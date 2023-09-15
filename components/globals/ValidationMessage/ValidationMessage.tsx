import React from "react";

export enum MessageType {
  ERROR = "ERROR",
}

const BackgroundClasses = {
  error: "border-red bg-red-50",
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
  return (
    <div
      role="alert"
      className={`border-l-4 p-3 ${messageType === MessageType.ERROR && BackgroundClasses.error} ${
        show ? "" : "visually-hidden"
      }`}
    >
      {show && <p className="text-sm font-bold">{children}</p>}
    </div>
  );
};
