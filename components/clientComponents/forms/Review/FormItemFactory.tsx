import { FileInputResponse, FormElementTypes } from "@lib/types";
import { BaseElement } from "./FormElements/BaseElement";
import { BaseElementArray } from "./FormElements/BaseElementArray";
import { FormItem } from "./helpers";
import { Language } from "@lib/types/form-builder-types";
import { AddressComplete } from "./FormElements/AddressComplete/AddressComplete";
import { FormattedDate } from "./FormElements/FormattedDate";
import { FileInput } from "./FormElements/FileInput";
import { DynamicRow } from "./FormElements/DyanmicRow/DynamicRow";
import { RichText } from "./FormElements/RichText";

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

  // Overides with fileInput type to print the custom element below (vs. as an Input)
  if ((formItem.values as FileInputResponse)?.based64EncodedFile !== undefined) {
    formItem.type = FormElementTypes.fileInput;
  }

  // Note: order matters, from more specific to more generic
  switch (formItem.type) {
    case FormElementTypes.dynamicRow:
      return <DynamicRow formItem={formItem} language={language} />;

    case FormElementTypes.fileInput:
      return <FileInput formItem={formItem} />;

    case FormElementTypes.formattedDate:
      return <FormattedDate formItem={formItem} />;

    case FormElementTypes.addressComplete:
    case FormElementTypes.address: // TODO deprecated?
      return <AddressComplete formItem={formItem} language={language} forceSplitAddress={true} />;

    case FormElementTypes.richText:
      return <RichText formItem={formItem} language={language} showNothing={true} />;

    // Multi-value base Form elements
    case FormElementTypes.checkbox:
    case FormElementTypes.attestation:
      return <BaseElementArray formItem={formItem} />;

    // Single value base Form elements e.g. input, textarea, radio, select, combobox, departments...
    default:
      return <BaseElement formItem={formItem} />;
  }
};
