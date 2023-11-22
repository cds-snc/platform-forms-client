import React from "react";

export const enum StatusMessageLevel {
  DEFAULT,
  SUCCESS,
  ERROR,
}

export const StatusMessage = ({
  primaryMessage,
  secondaryMessage,
  level = StatusMessageLevel.DEFAULT,
}: {
  primaryMessage: string;
  secondaryMessage?: string;
  level?: StatusMessageLevel;
}) => {
  let levelAsClass;
  switch (level) {
    case StatusMessageLevel.SUCCESS:
      levelAsClass = " violet-700 ";
      break;
    case StatusMessageLevel.ERROR:
      levelAsClass = " text-red-700 ";
      break;
    default:
      levelAsClass = "";
  }

  return (
    <div className={levelAsClass}>
      <div className={secondaryMessage ? "font-bold" : ""}>{primaryMessage}</div>
      {secondaryMessage && <div className="mt-1">{secondaryMessage}</div>}
    </div>
  );
};
