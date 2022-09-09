import { Text } from "slate";

export const serialize = (node) => {
  if (Text.isText(node)) {
    let string = node.text;
    if (node.text.trim() == "") {
      return "";
    }
    if (node.bold) {
      return `**${string}**`;
    }
    if (node.italic) {
      return `*${string}*`;
    }
    return `${string}`;
  }

  const children = node.children.map((n) => serialize(n)).join("");

  switch (node.type) {
    case "quote":
      return `\n> ${children}\n`;
    case "paragraph":
      return `\n${children}`;
    case "link":
      return `[${children}](${node.url})`;
    case "heading-two":
      return `## ${children}\n`;
    case "heading-three":
      return `### ${children}\n`;
    case "list-item":
      return `- ${children}\n`;
    default:
      return children;
  }
};
