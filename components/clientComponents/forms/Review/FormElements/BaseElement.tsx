import { FormItem } from "../helpers";

export const BaseElement = ({
  formItem,
}: {
  formItem: FormItem | undefined;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  return (
    <dl className="mb-8">
      <dt className="mb-2 font-bold">{formItem.label}</dt>
      <dd>
        {formItem.values
          ? String(formItem.values)
              .split("\n")
              .map((line, i) => (
                <span key={i}>
                  {line}
                  {i < String(formItem.values).split("\n").length - 1 && <br />}
                </span>
              ))
          : "-"}
      </dd>
    </dl>
  );
};
