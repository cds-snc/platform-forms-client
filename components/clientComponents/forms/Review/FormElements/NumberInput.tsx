import { formatUserInput } from "@lib/utils/strings";
import { FormItem } from "../helpers";
import { isNumberInput } from "@gcforms/core";
import {
  formatNumericStringForDisplay,
  getNumberFormatOptions,
  isNumericInput,
  langToLocale,
} from "../../NumberInput/utils";
import { Language } from "@lib/types/form-builder-types";

export const NumberInput = ({
  formItem,
  lang,
}: {
  formItem: FormItem | undefined;
  lang: Language;
}): React.ReactElement => {
  if (!formItem || !formItem.element || !isNumberInput(formItem.element)) {
    return <></>;
  }

  const rawValue = String(formItem.values);
  const locale = langToLocale(lang);
  const options = getNumberFormatOptions({
    currencyCode: formItem.element.properties.currencyCode,
    stepCount: formItem.element.properties.stepCount,
    useThousandsSeparator: formItem.element.properties.useThousandsSeparator,
  });

  // Format from the raw string (not Number()) so large integers/decimals aren't rounded.
  const formattedNumber = isNumericInput(rawValue)
    ? formatNumericStringForDisplay(rawValue, locale, options)
    : rawValue;

  return (
    <dl className="mb-8">
      <dt className="mb-2 font-bold">
        {formItem.label} ({lang})
      </dt>
      <dd dangerouslySetInnerHTML={{ __html: formatUserInput(String(formattedNumber)) }} />
    </dl>
  );
};
