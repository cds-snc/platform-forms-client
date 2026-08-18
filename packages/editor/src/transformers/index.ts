import { TextMatchTransformer } from "@lexical/markdown";
import { $createTextNode, $isLineBreakNode, LineBreakNode } from "lexical";
export { COLLAPSIBLE } from "./collapsible";

export const LINE_BREAK_FIX: TextMatchTransformer = {
  dependencies: [LineBreakNode],
  export: (node) => {
    if (!$isLineBreakNode(node)) return null;
    return "  \n";
  },
  regExp: /\\$/,
  importRegExp: /\\$/,
  replace: (textNode) => {
    if (!textNode?.getParent()) return;
    textNode.replace($createTextNode());
  },
  trigger: "",
  type: "text-match",
};
