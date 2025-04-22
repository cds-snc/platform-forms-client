import { HeadingNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";

export const editorConfig = {
  namespace: "FormBuilder",
  theme: {
    text: {
      bold: "font-bold",
      italic: "italic",
    },
  },
  // Handling of errors during update
  onError(error: Error) {
    throw error;
  },
  // Any custom nodes go here
  nodes: [HeadingNode, LinkNode, ListItemNode, ListNode],
};
