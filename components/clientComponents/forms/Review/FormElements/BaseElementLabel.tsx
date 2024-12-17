import { FormItem } from "../helpers";

// Prints only the label (not the sub value)
export const BaseElementLabel = ({
  formItem,
}: {
  formItem: FormItem | undefined;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  return <div className="mb-8 mb-2 font-bold">{formItem.label}</div>;
};
