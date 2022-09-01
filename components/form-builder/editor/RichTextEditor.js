import React, { useState, useCallback } from "react";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { Toolbar } from "./ToolBar";
import { initialValue } from "./util";
import { Container, EditorStyles } from "./styles";

export const RichTextEditor = () => {
  const [editor] = useState(() => withReact(createEditor()));
  const [value, setValue] = useState(initialValue);
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

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
