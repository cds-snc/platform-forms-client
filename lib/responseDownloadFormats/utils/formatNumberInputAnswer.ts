import { formatNumberForDisplay } from "@clientComponents/forms/NumberInput/utils";
import { getElementOrSubElementById } from "@gcforms/core";
import { Language } from "@lib/types/form-builder-types";
import { FormElementTypes, FormRecord, ElementProperties } from "@lib/types";

import { Answer } from "../types";

export const formatNumberInputAnswer = (
  item: Answer,
  lang: Language,
  formRecord: FormRecord
): string | undefined => {
  if (item.type !== FormElementTypes.numberInput) {
    return undefined;
  }

  const element = getElementOrSubElementById(formRecord.form.elements, String(item.questionId));
  const rawNumber = parseFloat(String(item.answer));

  // If the stored answer can't be parsed as a number (empty or invalid), fall back to the
  // raw answer so it isn't silently dropped from downloads.
  if (Number.isNaN(rawNumber)) {
    return String(item.answer);
  }

  const numberProperties = element?.properties as ElementProperties<"numberInput"> | undefined;
  return formatNumberForDisplay(rawNumber, lang, {
    currencyCode: numberProperties?.currencyCode,
    stepCount: numberProperties?.stepCount,
    useThousandsSeparator: numberProperties?.useThousandsSeparator,
  });
};
