import React from "react";
import { RoundThinXCloseIcon } from "@appComponents/form-builder/icons";
import { useTranslation } from "next-i18next";

type LineItemProps = {
  value: string;
  isInvalid?: boolean;
  onRemove: (value: string) => void;
};

export const LineItem = ({ value, isInvalid = false, onRemove }: LineItemProps) => {
  const { t } = useTranslation("form-builder-responses");
  const label = `${t("lineItemEntries.remove")} ${value}`;
  return (
    <li data-testid="value" className="pl-6 hover:bg-[#fffbf3]">
      <div className="flex justify-between items-center pr-4 py-2">
        <span className={`${isInvalid ? " text-red" : ""}`}>{value}</span>
        <button
          className={`
            align-middle border border-black rounded-full [&_svg]:fill-white [&_rect]:fill-black mt-[5px] mb-[5px] mr-[5px]
            [&_svg]:hover:fill-gray-600 [&_rect]:hover:fill-white 
            [&_svg]:focus:fill-[#3242bc] [&_rect]:focus:fill-white focus:border-[#3242bc] focus:border-[4px] focus:p-[2px] focus:m-[0px]
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
