import { FormItem } from "@clientComponents/forms/Review/helpers";
import { BaseElement } from "@clientComponents/forms/Review/FormElements/BaseElement";
import { Language } from "@lib/types/form-builder-types";
import { formatUserInput } from "@lib/utils/strings";
import { isNumberInput } from "@root/packages/core/src";
import { formatNumberForDisplay } from "@clientComponents/forms/NumberInput/utils";

export const NumberInputReviewItem = ({
  formItem,
  lang,
}: {
  formItem: FormItem | undefined;
  lang: Language;
}): React.ReactElement => {
  if (!formItem || !formItem.element) {
    return <></>;
  }

  if (!isNumberInput(formItem.element)) {
    return <BaseElement formItem={formItem} />;
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
