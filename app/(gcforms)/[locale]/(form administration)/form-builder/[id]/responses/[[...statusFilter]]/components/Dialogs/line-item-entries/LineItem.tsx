"use client";
import React from "react";
import { RoundThinXCloseIcon } from "@serverComponents/icons";
import { useTranslation } from "@i18n/client";

type LineItemProps = {
  value: string;
  isInvalid?: boolean;
  onRemove: (value: string) => void;
};

export const LineItem = ({ value, isInvalid = false, onRemove }: LineItemProps) => {
  const { t } = useTranslation("form-builder-responses");
  const label = `${t("downloadResponsesModals.lineItemEntries.remove")} ${value}`;
  return (
    <li data-testid="value" className="pl-6 hover:bg-[#fffbf3]">
      <div className="flex items-center justify-between py-2 pr-4">
        <span className={`${isInvalid ? " text-red" : ""}`}>{value}</span>
        <button
          className={`
            my-[5px] mr-[5px] rounded-full border border-black align-middle focus:m-[0px] focus:border-[4px] focus:border-[#3242bc]
            focus:p-[2px] [&_rect]:fill-black 
            [&_rect]:hover:fill-white [&_rect]:focus:fill-white [&_svg]:fill-white [&_svg]:hover:fill-gray-600 [&_svg]:focus:fill-[#3242bc]
          `}
          onClick={() => onRemove(value)}
          aria-label={label}
        >
          <RoundThinXCloseIcon />
        </button>
      </div>
    </li>
  );
};
