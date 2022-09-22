import { TEditableProps } from "@udecode/plate";
import { MyValue } from "./types";

export const editableProps: TEditableProps<MyValue> = {
  spellCheck: false,
  autoFocus: false,
  readOnly: false,
  placeholder: "Type…",
};
