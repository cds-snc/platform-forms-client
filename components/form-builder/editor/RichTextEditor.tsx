import React, { useState, useCallback } from "react";
import { createEditor, Descendant } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { Toolbar } from "./ToolBar";
import { Children, CustomElement, CustomText } from "./slate-editor";
import { initialValue } from "./util";
import { Container, EditorStyles } from "./styles";

export const RichTextEditor = () => {
  const [editor] = useState(() => withReact(createEditor()));

  const [value, setValue] = useState<Descendant[]>(initialValue);

  const renderElement = useCallback(
    (props: { element: CustomElement }) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: { leaf: CustomText; children: Children }) => <Leaf {...props} />,
    []
  );

  return (
    <Container>
      <EditorStyles>
        <Slate editor={editor} value={value} onChange={(value) => setValue(value)}>
          <Toolbar />
          <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
        </Slate>
      </EditorStyles>
    </Container>
  );
};
