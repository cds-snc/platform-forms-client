import React, { useState, useCallback, HTMLAttributes } from "react";
import { createEditor, Descendant, BaseEditor } from "slate";
import { ReactEditor, Slate, Editable, withReact } from "slate-react";

type CustomElement = { type: string; children: CustomText[] };
type CustomText = { text: string; bold?: boolean; italic?: boolean };
type Children = JSX.Element | JSX.Element[] | string | string[];

declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

const initialValue: Descendant[] = [
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

const Element = ({
  attributes,
  children,
  element,
}: {
  attributes?: HTMLAttributes<HTMLElement>;
  children?: Children;
  element: CustomElement;
}) => {
  const style = {};
  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      );
    case "heading-one":
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case "heading-two":
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case "numbered-list":
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

const Leaf = ({
  attributes,
  children,
  leaf,
}: {
  attributes?: [];
  children: Children;
  leaf: CustomText;
}) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  return <span {...attributes}>{children}</span>;
};

export const RichText = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const renderElement = useCallback(
    (props: { element: CustomElement }) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: { leaf: CustomText; children: Children }) => <Leaf {...props} />,
    []
  );

  return (
    <Slate editor={editor} value={initialValue}>
      <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
    </Slate>
  );
};
