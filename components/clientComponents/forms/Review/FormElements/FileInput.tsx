import { FileInputResponse } from "@lib/types";
import { FormItem } from "../helpers";
import { BaseElement } from "./BaseElement";

export const FileInput = ({ formItem }: { formItem: FormItem | undefined }): React.ReactElement => {
  if (!formItem) {
    return <></>;
  }

  const file = formItem.values as FileInputResponse;

  if (!file || !file.name || !file.size || file.size < 0) {
    return <BaseElement formItem={{ ...formItem, values: "-" } as FormItem} />;
  }

  const fileSizeInMB = (file.size / 1024 / 1024).toFixed(2);
  const fileAsString = `${file.name} (${fileSizeInMB} MB)`;
  return <BaseElement formItem={{ ...formItem, values: fileAsString } as FormItem} />;
};
