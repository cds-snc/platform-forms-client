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
    if (node.underline) {
      return `_${string}_`;
    }
    return `${string}`;
  }

  const children = node.children.map((n) => serialize(n)).join("");

  switch (node.type) {
    case "quote":
      return `> ${children} \n `;
    case "paragraph":
      return `${children} \n\n `;
    case "link":
      return `[${children}](${node.url})`;
    case "heading-two":
      return `\n ## ${children} \n`;
    case "heading-three":
      return `\n### ${children} \n`;
    case "bulleted-list":
      return `${children} \n`;
    case "list-item":
      return `- ${children} \n `;
    default:
      return children;
  }
};
