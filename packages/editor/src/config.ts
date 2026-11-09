import { $createHeadingNode, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { ClipboardDOMImportExtension } from "@lexical/clipboard";
import { DOMImportExtension, defineImportRule, sel } from "@lexical/html";
import { $convertFromMarkdownString, TRANSFORMERS } from "@lexical/markdown";
import { $createTextNode, configExtension, defineExtension } from "lexical";
import { CollapsibleExtension } from "./plugins/CollapsibleExtension";
import { COLLAPSIBLE } from "./transformers";

const pastedH1Rule = defineImportRule({
  $import: (_ctx, element) => {
    const node = $createHeadingNode("h2");
    const textContent = element.textContent ?? "";
    node.append($createTextNode(textContent));
    return [node];
  },
  match: sel.tag("h1"),
  name: "@gcforms/editor/pasted-h1",
});

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
    dependencies: [
      CollapsibleExtension,
      configExtension(DOMImportExtension, {
        rules: [pastedH1Rule],
      }),
      ClipboardDOMImportExtension,
    ],
    $initialEditorState: (editor) => {
      editor.update(() => {
        $convertFromMarkdownString(content, [...TRANSFORMERS, COLLAPSIBLE]);
      });
    },
  });
