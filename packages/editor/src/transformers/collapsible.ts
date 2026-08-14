import {
  MultilineElementTransformer,
  $convertFromMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { $createParagraphNode, $createTextNode } from "lexical";
import {
  $createCollapsibleContainerNode,
  $createCollapsibleContentNode,
  $createCollapsibleTitleNode,
  $isCollapsibleContainerNode,
  $isCollapsibleContentNode,
  $isCollapsibleTitleNode,
  CollapsibleContentNode,
} from "../nodes/CollapsibleNodes";

const COLLAPSIBLE_TRANSFORMERS = () => [...TRANSFORMERS, COLLAPSIBLE];

export const COLLAPSIBLE: MultilineElementTransformer = {
  dependencies: [
    // The transformer is registered after the node classes, so this dependency is replaced below.
    CollapsibleContentNode,
  ],
  type: "multiline-element",
  regExpStart: /^:::collapsible(?:\s+(.*))?$/,
  regExpEnd: /^:::\s*$/,
  export: (node, traverseChildren) => {
    if (!$isCollapsibleContainerNode(node)) return null;
    const [title, content] = node.getChildren();
    if (!$isCollapsibleTitleNode(title) || !$isCollapsibleContentNode(content)) return null;
    const titleText = title.getTextContent().trim();
    return `:::collapsible${titleText ? ` ${titleText}` : ""}\n${traverseChildren(content)}\n:::`;
  },
  handleImportAfterStartMatch: ({ rootNode, startMatch, lines, startLineIndex }) => {
    const content = [] as string[];
    let endLineIndex = startLineIndex + 1;
    while (endLineIndex < lines.length && !/^:::\s*$/.test(lines[endLineIndex])) {
      content.push(lines[endLineIndex]);
      endLineIndex++;
    }

    const container = $createCollapsibleContainerNode();
    const title = $createCollapsibleTitleNode();
    const titleParagraph = $createParagraphNode();
    titleParagraph.append($createTextNode(startMatch[1] || "Details"));
    title.append(titleParagraph);

    const body = $createCollapsibleContentNode();
    $convertFromMarkdownString(content.join("\n"), COLLAPSIBLE_TRANSFORMERS(), body);
    if (body.getChildrenSize() === 0) body.append($createParagraphNode());

    container.append(title, body);
    rootNode.append(container);
    return [true, Math.min(endLineIndex, lines.length - 1)];
  },
  replace: () => false,
};
