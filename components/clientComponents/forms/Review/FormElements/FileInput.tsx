import { FileInputResponse } from "@lib/types";
import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";
import { type Language } from "@lib/types/form-builder-types";
import { customTranslate } from "@lib/i18nHelpers";

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

  const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
  const fileAsString = `${file.name} (${fileSizeInMB} ${t("input-validation.MB", {
    lng: language,
  })})`;
  return <BaseElement formItem={{ ...formItem, values: fileAsString } as FormItem} />;
};
