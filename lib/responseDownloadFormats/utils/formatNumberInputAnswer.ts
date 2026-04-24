import { formatNumberForDisplay } from "@clientComponents/forms/NumberInput/utils";
import { getElementOrSubElementById } from "@gcforms/core";
import { Language } from "@lib/types/form-builder-types";
import { FormElementTypes, FormRecord } from "@lib/types";

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

  return formatNumberForDisplay(Number(rawNumber), lang, {
    currencyCode: element?.properties.currencyCode,
    stepCount: element?.properties.stepCount,
    useThousandsSeparator: element?.properties.useThousandsSeparator,
  });
};
