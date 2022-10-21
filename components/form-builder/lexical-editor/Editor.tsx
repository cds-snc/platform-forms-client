import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { editorConfig } from "./config";
import { Toolbar } from "./Toolbar";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";

const RichTextWrapper = styled.div``;

const Placeholder = styled.div`
  color: #999;
  overflow: hidden;
  position: absolute;
  text-overflow: ellipsis;
  top: 90px;
  left: 30px;
  font-size: 15px;
  user-select: none;
  display: inline-block;
  pointer-events: none;
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
    <RichTextWrapper style={{ width: "100%" }}>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editorState: () => $convertFromMarkdownString(content, TRANSFORMERS),
        }}
      >
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<Placeholder> Enter some rich text...</Placeholder>}
        />
        <TreeViewPlugin />
        <LinkPlugin />

        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              // Read the contents of the EditorState here.
              const markdown = $convertToMarkdownString(TRANSFORMERS);
              onChange(markdown);
            });
          }}
        />
      </LexicalComposer>
    </RichTextWrapper>
  );
};

Editor.propTypes = {
  id: PropTypes.string,
  content: PropTypes.string,
  onChange: PropTypes.func,
};
