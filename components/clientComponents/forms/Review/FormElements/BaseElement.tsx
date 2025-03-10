import { FormItem } from "../helpers";
import { htmlNewline } from "@lib/utils/htmlNewline";

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
      <dd dangerouslySetInnerHTML={{ __html: htmlNewline(formItem.values) }} />
    </dl>
  );
};
