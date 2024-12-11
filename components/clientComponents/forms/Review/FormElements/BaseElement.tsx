import { FormItem } from "../helpers";

export const BaseElement = ({ formItem }: { formItem: FormItem | undefined }): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }
  
  return (
    <div className="mb-8">
      <dt className="mb-2 font-bold">{formItem.label}</dt>
      <dd>{formItem.values ? String(formItem.values) : "-"}</dd>
    </div>
  );
};
