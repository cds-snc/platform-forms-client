"use client";
import React from "react";
import { getLocalizedProperty } from "@lib/utils";
import { DateFormat } from "@clientComponents/forms/FormattedDate/types";
import { FormattedDate } from "./FormattedDate";
import type { ViewerProps } from "../types";

export const ViewerComponent = ({ element, language: lang }: ViewerProps) => {
  const id = element.subId ?? element.id;
  const isRequired = element.properties.validation?.required ?? false;
  const labelText = (element.properties[getLocalizedProperty("title", lang)] ?? "") as string;
  const descriptionText = (element.properties[getLocalizedProperty("description", lang)] ??
    "") as string;

  return (
    <div data-testid="plugin-formattedDate" className="focus-group">
      <FormattedDate
        label={labelText}
        description={descriptionText}
        id={`${id}`}
        name={`${id}`}
        required={isRequired}
        dateFormat={
          element.properties.dateFormat ? (element.properties.dateFormat as DateFormat) : undefined
        }
        autocomplete={element.properties.autoComplete}
        lang={lang}
      />
    </div>
  );
};
