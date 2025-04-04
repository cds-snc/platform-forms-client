import { HeadingNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import basicTheme from "./themes/BasicTheme";

export const editorConfig = {
  namespace: "FormBuilder",
  // The editor theme
  theme: basicTheme,
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [HeadingNode, LinkNode, ListItemNode, ListNode],
};
