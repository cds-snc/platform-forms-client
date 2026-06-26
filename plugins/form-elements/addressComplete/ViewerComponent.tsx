"use client";
import React from "react";
import { getLocalizedProperty } from "@lib/utils";
import { AddressComplete } from "./AddressComplete";
import type { ViewerProps } from "../types";

export const ViewerComponent = ({ element, language: lang }: ViewerProps) => {
  const id = element.subId ?? element.id;
  const isRequired = element.properties.validation?.required ?? false;
  const labelText = (element.properties[getLocalizedProperty("title", lang)] ?? "") as string;
  const descriptionText = (element.properties[getLocalizedProperty("description", lang)] ??
    "") as string;
  const addressComponents = element.properties.addressComponents;

  return (
    <div data-testid="plugin-addressComplete" className="focus-group">
      <AddressComplete
        label={labelText}
        id={`${id}`}
        name={`${id}`}
        ariaDescribedBy={descriptionText}
        key={`${id}-${lang}`}
        splitAddress={addressComponents?.splitAddress}
        canadianOnly={addressComponents?.canadianOnly}
        required={isRequired}
        lang={lang}
      />
    </div>
  );
};
