"use client";
import React from "react";
import { DateFormat } from "@clientComponents/forms/FormattedDate/types";
import { DateElement } from "@root/plugins/shared";
import type { BuilderProps } from "../types";

export const BuilderComponent = ({ item }: BuilderProps) => {
  return (
    <DateElement
      dateFormat={
        item.properties.dateFormat ? (item.properties.dateFormat as DateFormat) : undefined
      }
    />
  );
};
