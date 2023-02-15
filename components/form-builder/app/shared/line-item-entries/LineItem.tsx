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
      className="flex justify-between items-center pr-4 py-2 hover:bg-gray-100"
    >
      <div className="flex pl-6">
        {index !== undefined && !Number.isNaN(index) && <span className="pr-4">{index}.</span>}
        <div>{value}</div>
      </div>
      <button
        className="[&_svg]:fill-gray-500 [&_svg]:hover:fill-red-500 [&_svg]:focus:fill-red-500 ml-2 p-[1px] align-middle"
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
