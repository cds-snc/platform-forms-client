import React from "react";
import { ExclamationIcon } from "@components/form-builder/icons";

export const ExclamationText = ({
  text,
  className = "flex items-center",
  isShowIcon = true,
}: {
  text: string;
  className?: string;
  isShowIcon?: boolean;
}) => {
  return (
    <div className={className}>
      {isShowIcon && <ExclamationIcon className="mr-1" />}
      <span className="font-bold text-[#bc3332]">{text}</span>
    </div>
  );
};
