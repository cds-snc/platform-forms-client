import { Descendant, Editor, Element as SlateElement, Transforms } from "slate";
import { ReactEditor } from "slate-react";
import { Format} from "./slate-editor";
const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify']

export const initialValue: Descendant[] = [
  {
    type: "paragraph",
    children: [
      { text: "A line of text in a paragraph." },
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much" },
      { text: " better than a " },
      { text: "!" },
    ],
  },
];

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

export const toggleBlock = (editor:Editor, format:Format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  )
  const isList = LIST_TYPES.includes(format)

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
}

const isBlockActive = (editor: Editor, format: Format, blockType: any) => {
  const { selection } = editor;
  if (!selection) return false;

  console.log(blockType);

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n[blockType] === format,
    })
  );

  return !!match;
};

export const activeMark = (editor: Editor, format: Format) => {
  const marks = Editor.marks(editor);
  return marks?.[format];
};
