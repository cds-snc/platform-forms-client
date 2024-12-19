import { safeJSONParse } from "@lib/utils";
import { FormItem } from "../helpers";
import { getFormattedDateFromObject } from "@clientComponents/forms/FormattedDate/utils";
import { DateFormat, DateObject } from "@clientComponents/forms/FormattedDate/types";
import { BaseElement } from "./BaseElement";

export const FormattedDate = ({
  formItem,
}: {
  formItem: FormItem | undefined;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const formattedDateKeyValues = safeJSONParse(formItem.values as string) as DateObject;
  const formattedDateFormat = Object.keys(formattedDateKeyValues).join("-") as DateFormat;
  const formattedDate = getFormattedDateFromObject(formattedDateFormat, formattedDateKeyValues);
  const formItemAsDate = {
    ...formItem,
    values: formattedDate,
  } as FormItem;

  return <BaseElement formItem={formItemAsDate} />;
};
