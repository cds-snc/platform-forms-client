"use client";
import React from "react";
import { LineItem } from "./LineItem";

type LineItemsProps = {
  values: string[];
  errorEntriesList: string[];
  onRemove: (value: string) => void;
  validateInput?: (tag: string) => boolean;
};

export const LineItems = ({
  values = [],
  errorEntriesList = [],
  onRemove,
  validateInput,
}: LineItemsProps) => {
  if (values.length <= 0) {
    return null;
  }

  return (
    <>
      {values.map((value, index) => (
        <LineItem
          value={value}
          key={`${value}-${index}`}
          onRemove={onRemove}
          isInvalid={
            errorEntriesList.find((valueError) => value === valueError) ||
            (validateInput && !validateInput(value))
              ? true
              : false
          }
        />
      ))}
    </>
  );
};
