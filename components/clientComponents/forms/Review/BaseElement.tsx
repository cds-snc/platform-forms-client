import { FormItem } from "./Review";

export const BaseElement = ({
  formItem
}: {
  formItem: FormItem
}): React.ReactElement => {
  return (
    <div className="mb-8">
      <dt className="mb-2 font-bold">{formItem.label}</dt>
      <dd>{formItem.values ? String(formItem.values) : "-"}</dd>
    </div>
  );
};
