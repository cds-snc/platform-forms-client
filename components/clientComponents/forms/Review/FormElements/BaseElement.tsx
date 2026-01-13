import { formatUserInput } from "@lib/utils/strings";
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
      <dd dangerouslySetInnerHTML={{ __html: formatUserInput(String(formItem.values)) }} />
    </dl>
  );
};
