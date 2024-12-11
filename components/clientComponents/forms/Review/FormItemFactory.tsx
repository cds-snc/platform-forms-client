import { FormElementTypes } from "@lib/types";
import { BaseElement } from "./FormElements/BaseElement";
import { BaseElementArray } from "./FormElements/BaseElementArray";
import { FormItem } from "./helpers";
import { Language } from "@lib/types/form-builder-types";
import { AddressComplete } from "./FormElements/AddressComplete";

export const FormItemFactory = ({ formItem, language }: { formItem: FormItem; language: Language }): React.ReactElement => {
  if (!formItem || !formItem.type) {
    return <></>;
  }

  switch (formItem.type) {
    case FormElementTypes.addressComplete:
      return <AddressComplete formItem={formItem} language={language} />
    
      // Multi-value base Form elements e.g.
    case FormElementTypes.checkbox:
      return <BaseElementArray formItem={formItem} />;
    
      // Single value base Form elements e.g. input, textarea, radio, select..
    default:
      return <BaseElement formItem={formItem} />;
  }
};
