import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { editorConfig } from "./config";
import { Toolbar } from "./Toolbar";

// import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
// import ToolbarPlugin from "./plugins/FloatingLinkEditor";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";

const RichTextWrapper = styled.div`
  .editor-input {
    padding: 20px;
  }
`;

export const Editor = ({
  content,
  onChange,
}: {
  content: string;
  onChange: (value: string) => void;
}) => {
  if (typeof content !== "string") {
    content = "";
  }

  return (
    <RichTextWrapper>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editorState: () => $convertFromMarkdownString(content, TRANSFORMERS),
        }}
      >
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={""}
        />

        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              // Read the contents of the EditorState here.
              const markdown = $convertToMarkdownString(TRANSFORMERS);
              onChange(markdown);
            });
          }}
        />

        {/* <ToolbarPlugin />
        <TreeViewPlugin />
        <LinkPlugin /> */}
        <LinkPlugin />
      </LexicalComposer>
    </RichTextWrapper>
  );
};

Editor.propTypes = {
  id: PropTypes.string,
  content: PropTypes.string,
  onChange: PropTypes.func,
};
