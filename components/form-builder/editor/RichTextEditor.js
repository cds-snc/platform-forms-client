import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { Leaf } from "./Leaf";
import { Element } from "./Element";
import { Toolbar } from "./ToolBar";
import { Container, EditorStyles } from "./styles";

// https://github.com/ianstormtaylor/slate/blob/main/site/examples/richtext.tsx

const StyledEditableArea = styled.div`
  padding: 5px;
`;

export const RichTextEditor = ({ value, onChange }) => {
  const [editor] = useState(() => withReact(createEditor()));
  const renderElement = useCallback((props) => <Element {...props} />, []);
  const renderLeaf = useCallback((props) => <Leaf {...props} />, []);

  return (
    <Container>
      <EditorStyles>
        <Slate
          editor={editor}
          value={value}
          onChange={(value) => {
            onChange(JSON.stringify(value));
          }}
        >
          <Toolbar />
          <StyledEditableArea>
            <Editable renderElement={renderElement} renderLeaf={renderLeaf} />
          </StyledEditableArea>
        </Slate>
      </EditorStyles>
    </Container>
  );
};

RichTextEditor.propTypes = {
  value: PropTypes.array,
  onChange: PropTypes.func,
};
