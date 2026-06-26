import React from "react";
import { safeJSONParse } from "@lib/utils";
import { getFormattedDateFromObject } from "@clientComponents/forms/FormattedDate/utils";
import { DateFormat, DateObject } from "@clientComponents/forms/FormattedDate/types";
import { BaseElement } from "@clientComponents/forms/Review/FormElements/BaseElement";
import type { ReviewProps } from "../types";

export const ReviewComponent = ({ formItem }: ReviewProps) => {
  if (!formItem) {
    return <></>;
  }

  const formattedDateKeyValues = safeJSONParse(formItem.values as string) as DateObject;

  if (!formattedDateKeyValues) {
    return <BaseElement formItem={formItem} />;
  }

  const formattedDateFormat = Object.keys(formattedDateKeyValues).join("-") as DateFormat;
  const formattedDate = getFormattedDateFromObject(formattedDateFormat, formattedDateKeyValues);
  const formItemAsDate = {
    ...formItem,
    values: formattedDate,
  };

  return <BaseElement formItem={formItemAsDate} />;
};
