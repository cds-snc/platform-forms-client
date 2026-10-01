import { formatUserInput } from "@lib/utils/strings";
import { FormItem } from "../helpers";
import { isNumberInput } from "@root/packages/core/src";
import { formatNumberForDisplay } from "../../NumberInput/utils";
import { Language } from "@root/lib/types/form-builder-types";
import { type ElementProperties } from "@root/lib/types";

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

  const numberProperties = formItem.element.properties as ElementProperties<"numberInput">;
  const formattedNumber = formatNumberForDisplay(Number(formItem.values), lang, {
    currencyCode: numberProperties.currencyCode,
    stepCount: numberProperties.stepCount,
    useThousandsSeparator: numberProperties.useThousandsSeparator,
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
