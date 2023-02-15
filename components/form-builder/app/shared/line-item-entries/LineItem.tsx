import React from "react";

import { RoundThinXCloseIcon } from "@components/form-builder/icons";
import { useTranslation } from "next-i18next";

type LineItemProps = {
  value: string;
  index?: number;
  onRemove: (value: string) => void;
};

export const LineItem = ({ value, index, onRemove }: LineItemProps) => {
  const { t } = useTranslation("form-builder");
  const label = `${t("remove")} ${value}`;
  return (
    <div
      data-testid="value"
      className="flex justify-between items-center pr-4 py-2 hover:bg-[#fffbf3]"
    >
      <div className="flex pl-6">
        {index !== undefined && !Number.isNaN(index) && <span className="pr-4">{index}.</span>}
        <div>{value}</div>
      </div>
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
  );
};

type LineItemsProps = {
  values: string[];
  onRemove: (value: string) => void;
};

export const LineItems = ({ values = [], onRemove }: LineItemsProps) => {
  if (values.length <= 0) {
    return null;
  }

  return (
    <>
      {values.map((value, index) => (
        <LineItem value={value} key={value} index={index + 1} onRemove={onRemove} />
      ))}
    </>
  );
};
