import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import {
  CollapsibleContainerNode,
  CollapsibleContentNode,
  CollapsibleTitleNode,
} from "./nodes/CollapsibleNodes";

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
  nodes: [
    HeadingNode,
    QuoteNode,
    LinkNode,
    ListItemNode,
    ListNode,
    CollapsibleContainerNode,
    CollapsibleTitleNode,
    CollapsibleContentNode,
  ],
};
