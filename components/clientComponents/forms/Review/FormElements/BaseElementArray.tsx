import { FormItem } from "../helpers";
import { escapeHtml } from "@lib/utils/escapeHtml";

export const BaseElementArray = ({
  formItem,
  splitValues,
}: {
  formItem: FormItem | undefined;
  splitValues?: boolean;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  return (
    <dl className="mb-8">
      <dt className="mb-2 font-bold">{formItem.label}</dt>
      <dd>
        {Array.isArray(formItem.values) && formItem.values.length > 0 ? (
          splitValues ? (
            <ul className="list-none px-0">
              {formItem.values.map((value, index) => (
                <li key={`${value}-${index}`} className="mb-4">
                  {escapeHtml(value as string)}
                </li>
              ))}
            </ul>
          ) : (
            escapeHtml(formItem.values.join(", "))
          )
        ) : (
          "-"
        )}
      </dd>
    </dl>
  );
};
