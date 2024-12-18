import { FormItem } from "../helpers";

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
    <div className="mb-8">
      <dt className="mb-2 font-bold">{formItem.label}</dt>
      <dd>
        {Array.isArray(formItem.values) ? (
          splitValues ? (
            <ul className="list-none px-0">
              {formItem.values.map((value, index) => (
                <li key={`${value}-${index}`} className="mb-4">
                  {value as string}
                </li>
              ))}
            </ul>
          ) : (
            formItem.values.join(", ")
          )
        ) : (
          "-"
        )}
      </dd>
    </div>
  );
};
