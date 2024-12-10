import { BaseElement } from "./FormElements/BaseElement";
import { BaseElementArray } from "./FormElements/BaseElementArray";
import { FormItem } from "./helpers";

export const FormItemBuilder = ({ formItem }: { formItem: FormItem }): React.ReactElement => {
  if (!formItem || !formItem.type) {
    return <></>;
  }

  switch (formItem.type) {
    // Multi-value base Form elements e.g.
    case "checkbox":
      return <BaseElementArray formItem={formItem} />;
    // Single value base Form elements e.g. input, textarea, radio, select..
    default:
      return <BaseElement formItem={formItem} />;
  }
};
