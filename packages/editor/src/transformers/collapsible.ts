import {
  $convertFromMarkdownString,
  MultilineElementTransformer,
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
} from "../plugins/CollapsibleExtension";

const collapsibleTransformers = () => [...TRANSFORMERS, COLLAPSIBLE];

export const COLLAPSIBLE: MultilineElementTransformer = {
  dependencies: [CollapsibleContentNode],
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
    const content: string[] = [];
    let endLineIndex = startLineIndex + 1;

    while (endLineIndex < lines.length && !/^:::\s*$/.test(lines[endLineIndex])) {
      content.push(lines[endLineIndex]);
      endLineIndex++;
    }

    const container = $createCollapsibleContainerNode(true);
    const title = $createCollapsibleTitleNode();
    title.append($createParagraphNode().append($createTextNode(startMatch[1] || "Details")));

    const body = $createCollapsibleContentNode();
    $convertFromMarkdownString(content.join("\n"), collapsibleTransformers(), body);
    if (body.getChildrenSize() === 0) body.append($createParagraphNode());

    rootNode.append(container.append(title, body));
    return [true, Math.min(endLineIndex, lines.length - 1)];
  },
  replace: () => false,
};
