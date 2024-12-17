import { FileInputResponse, FormElementTypes } from "@lib/types";
import { BaseElement } from "./FormElements/BaseElement";
import { BaseElementArray } from "./FormElements/BaseElementArray";
import { FormItem } from "./helpers";
import { Language } from "@lib/types/form-builder-types";
import { AddressComplete } from "./FormElements/AddressComplete/AddressComplete";
import { FormattedDate } from "./FormElements/FormattedDate";
import { FileInput } from "./FormElements/FileInput";
import { DynamicRow } from "./FormElements/DyanmicRow/DynamicRow";

export const FormItemFactory = ({
  formItem,
  language,
}: {
  formItem: FormItem;
  language: Language;
}): React.ReactElement => {
  if (!formItem || !formItem.type) {
    return <></>;
  }

  // Adds fileInput type for convenience
  if ((formItem.values as FileInputResponse)?.based64EncodedFile !== undefined) {
    formItem.type = FormElementTypes.fileInput;
  }

  // Note: order may matter, from more specific higher higher to more generic lower
  switch (formItem.type) {
    case FormElementTypes.dynamicRow:
      return <DynamicRow formItem={formItem} language={language} />;

    case FormElementTypes.fileInput:
      return <FileInput formItem={formItem} />;

    case FormElementTypes.formattedDate:
      return <FormattedDate formItem={formItem} />;

    // TODO - check if addressComplete has replaced address?
    case FormElementTypes.addressComplete:
    case FormElementTypes.address:
      return <AddressComplete formItem={formItem} language={language} />;

    // Multi-value base Form elements - use `checkbox` as the generic type for array like info
    case FormElementTypes.checkbox:
    case FormElementTypes.attestation:
      return <BaseElementArray formItem={formItem} />;

    // TODO: just the label should be printed (no empty value below)
    case FormElementTypes.richText:
      return <></>;

    // Single value base Form elements e.g. input, textarea, radio, select, combobox, departments...
    default:
      return <BaseElement formItem={formItem} />;
  }
};
