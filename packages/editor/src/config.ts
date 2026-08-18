import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { defineExtension } from "lexical";
import { CollapsibleExtension } from "./plugins/CollapsibleExtension";
import { COLLAPSIBLE } from "./transformers";

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
  nodes: [HeadingNode, QuoteNode, LinkNode, ListItemNode, ListNode],
};

export const createEditorExtension = (content: string) =>
  defineExtension({
    name: editorConfig.namespace,
    namespace: editorConfig.namespace,
    nodes: () => editorConfig.nodes,
    theme: editorConfig.theme,
    onError: editorConfig.onError,
    dependencies: [CollapsibleExtension],
    $initialEditorState: (editor) => {
      editor.update(() => {
        $convertFromMarkdownString(content, [...TRANSFORMERS, COLLAPSIBLE]);
      });
    },
  });
