import { Descendant, Editor, Transforms, Element as SlateElement } from "slate";
import { ReactEditor } from "slate-react";

import { Format } from "../types/slate-editor";

const list_types = ["orderedList", "unorderedList"];

export const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      { text: "A line of text in a paragraph." },
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "!" },
    ],
  },
];

export const toggleBlock = (editor: Editor, format: Format) => {
  const isActive = isBlockActive(editor, format);
  const isList = list_types.includes(format);
  /* 
  Transforms.unwrapNodes(editor, {
    match: (n) => list_types.includes(!Editor.isEditor(n) && SlateElement.isElement(n) && n.type),
    split: true,
  });
  */

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format,
  });

  if (isList && !isActive) {
    Transforms.wrapNodes(editor, {
      type: format,
      children: [],
    });
  }
};
export const addMarkData = (editor: Editor, data: { format: Format; value: boolean }) => {
  Editor.addMark(editor, data.format, data.value);
};
export const toggleMark = (editor: Editor, format: Format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
  ReactEditor.focus(editor);
};

export const isMarkActive = (editor: Editor, format: Format) => {
  const marks = Editor.marks(editor);

  return marks ? marks[format] === true : false;
};

export const isBlockActive = (editor: Editor, format: Format) => {
  const [match] = Editor.nodes(editor, {
    match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
  });

  return !!match;
};

export const activeMark = (editor: Editor, format: Format) => {
  const marks = Editor.marks(editor);
  return marks?.[format];
};
