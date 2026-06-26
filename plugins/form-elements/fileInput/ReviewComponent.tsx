import React from "react";
import { BaseElement } from "@clientComponents/forms/Review/FormElements/BaseElement";
import { customTranslate } from "@lib/i18nHelpers";
import { bytesToKbOrMbString } from "@lib/utils/fileSize";
import type { FileInputResponse } from "@lib/types";
import type { ReviewProps } from "../types";
import type { FormItem } from "@clientComponents/forms/Review/helpers";

export const ReviewComponent = ({ formItem, language }: ReviewProps): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const { t } = customTranslate("common");
  const file = formItem.values as FileInputResponse;

  if (!file || !file.name || !file.size || file.size < 0) {
    return <BaseElement formItem={{ ...formItem, values: "-" } as FormItem} />;
  }

  const { size, unit } = bytesToKbOrMbString(file.size, language);
  const fileAsString = `${file.name} (${size} ${t(`input-validation.${unit}`, { lng: language })})`;
  return <BaseElement formItem={{ ...formItem, values: fileAsString } as FormItem} />;
};
