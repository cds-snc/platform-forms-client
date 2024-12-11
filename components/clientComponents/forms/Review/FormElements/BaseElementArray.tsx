import { FormItem } from "../helpers";

export const BaseElementArray = ({ formItem }: { formItem: FormItem | undefined }): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }
  
  return (
    <div className="mb-8">
      <dt className="mb-2 font-bold">{formItem.label}</dt>
      <dd>{Array.isArray(formItem.values) ? formItem.values.join(", ") : "-"}</dd>
    </div>
  );
};
