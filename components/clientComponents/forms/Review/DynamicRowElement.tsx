import { FormValues } from "@lib/formContext";
import { FormItem } from "./Review";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";

export const DynamicRowElement = ({
  formItem,
}: {
  formItem: FormItem,
}): React.ReactElement => {
  const { groups, getValues, formRecord, getGroupHistory, getGroupTitle, matchedIds } =
  useGCFormsContext();
  
  
  // TODO

  const values = getValues();

  return (
    <div className="mb-8">
      <dt className="mb-2 font-bold">{formItem.label}</dt>
      <dd>{Array.isArray(formItem.values) ? formItem.values.join(", ") : "-"}</dd>
    </div>
  );
};
