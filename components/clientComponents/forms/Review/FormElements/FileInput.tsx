import { FileInputResponse } from "@lib/types";
import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";
import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";
import { bytesToKbOrMbString } from "@lib/utils/fileSize";

export const FileInput = ({
  formItem,
  language,
}: {
  formItem: FormItem | undefined;
  language: Language;
}): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const { t } = customTranslate("common");

  const file = formItem.values as FileInputResponse;

  if (!file || !file.name || !file.size || file.size < 0) {
    return <BaseElement formItem={{ ...formItem, values: "-" } as FormItem} />;
  }

  const { size, unit } = bytesToKbOrMbString(file.size, language);
  const fileAsString = `${file.name} (${size} ${t(`input-validation.${unit}`, {
    lng: language,
  })})`;
  return <BaseElement formItem={{ ...formItem, values: fileAsString } as FormItem} />;
};
