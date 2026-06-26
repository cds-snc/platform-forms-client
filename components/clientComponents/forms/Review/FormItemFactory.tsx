import { FileInputResponse, FormElementTypes } from "@lib/types";
import { BaseElement } from "./FormElements/BaseElement";
import { FormItem } from "./helpers";
import { Language } from "@lib/types/form-builder-types";
import { DynamicRow } from "./FormElements/DyanmicRow/DynamicRow";
import { getPlugin } from "@root/plugins/form-elements/registry";

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
  let itemType = formItem.type;

  // Overides with fileInput type to print the custom element below (vs. as an Input)
  if ((formItem.values as FileInputResponse)?.content !== undefined) {
    itemType = FormElementTypes.fileInput;
  }

  // Plugin-first dispatch: registered plugins take priority over the legacy switch.
  // A plugin with ReviewComponent: null indicates the element has no review representation.
  const plugin = getPlugin(itemType);
  if (plugin !== null) {
    if (plugin.ReviewComponent) {
      const { ReviewComponent } = plugin;
      return <ReviewComponent formItem={formItem} language={language} />;
    }
    return <></>;
  }

  switch (itemType) {
    case FormElementTypes.dynamicRow:
      return <DynamicRow formItem={formItem} language={language} />;

    // Single value base Form elements e.g. input, textarea, radio, select, combobox, departments...
    default:
      return <BaseElement formItem={formItem} />;
  }
};
