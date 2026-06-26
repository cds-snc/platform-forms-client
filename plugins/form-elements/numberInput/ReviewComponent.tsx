import React from "react";
import { isNumberInput } from "@gcforms/core";
import { formatUserInput } from "@lib/utils/strings";
import { formatNumberForDisplay } from "./utils";
import type { ReviewProps } from "../types";

export const ReviewComponent = ({ formItem, language: lang }: ReviewProps): React.ReactElement => {
  if (!formItem || !formItem.element || !isNumberInput(formItem.element)) {
    return <></>;
  }

  const formattedNumber = formatNumberForDisplay(Number(formItem.values), lang, {
    currencyCode: formItem.element.properties.currencyCode,
    stepCount: formItem.element.properties.stepCount,
    useThousandsSeparator: formItem.element.properties.useThousandsSeparator,
  });

  return (
    <dl className="mb-8">
      <dt className="mb-2 font-bold">
        {formItem.label} ({lang})
      </dt>
      <dd dangerouslySetInnerHTML={{ __html: formatUserInput(String(formattedNumber)) }} />
    </dl>
  );
};
