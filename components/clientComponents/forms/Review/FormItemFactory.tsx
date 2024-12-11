import { FormElementTypes } from "@lib/types";
import { BaseElement } from "./FormElements/BaseElement";
import { BaseElementArray } from "./FormElements/BaseElementArray";
import { FormItem } from "./helpers";
import { Language } from "@lib/types/form-builder-types";
import { AddressComplete } from "./FormElements/AddressComplete/AddressComplete";
import { FormattedDate } from "./FormElements/FormattedDate";

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

  /*
    TODO:
    fileInput = "fileInput",
    dynamicRow = "dynamicRow",

   */

  switch (formItem.type) {
    // TODO this may not need to be handled since not relevant to Review
    case FormElementTypes.richText:
      return <></>;

    // TODO - check if addressComplete has replaced address?
    case FormElementTypes.addressComplete:
    case FormElementTypes.address:
      return <AddressComplete formItem={formItem} language={language} />;

    // Multi-value base Form elements - use `checkbox` as the generic type for array like info
    case FormElementTypes.checkbox:
    case FormElementTypes.attestation:
      return <BaseElementArray formItem={formItem} />;

    case FormElementTypes.formattedDate:
      return <FormattedDate formItem={formItem} />;

    // Single value base Form elements
    /*
      e.g. input, textarea, radio, select.. -or- More specifically below
      textField = "textField",
      textArea = "textArea",
      dropdown = "dropdown",
      combobox = "combobox", (custom dropdown -  input)
      radio = "radio",
      name = "name",
      departments = "departments",
      firstMiddleLastName = "firstMiddleLastName", (repeated I think)
      contact = "contact", (repeated  I think)
    */
    default:
      return <BaseElement formItem={formItem} />;
  }
};
