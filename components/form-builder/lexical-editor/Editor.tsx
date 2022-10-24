import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { $createParagraphNode, $getRoot } from "lexical";
import { editorConfig } from "./config";
import { Toolbar } from "./Toolbar";
import { FocusPlugin } from "./plugins/FocusEditor";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
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
  autoFocusEditor,
}: {
  content: string;
  onChange: (value: string) => void;
  autoFocusEditor: boolean;
}) => {
  if (typeof content !== "string") {
    content = "";
  }
  return (
    <RichTextWrapper>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editorState: () => {
            if (!content) {
              const root = $getRoot();
              const paragraphNode = $createParagraphNode();
              root.append(paragraphNode);
              return;
            }
            $convertFromMarkdownString(content, TRANSFORMERS);
          },
        }}
      >
        <Toolbar />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={""}
        />
        <FocusPlugin autoFocusEditor={autoFocusEditor} />
        <OnChangePlugin
          onChange={(editorState) => {
            editorState.read(() => {
              // Read the contents of the EditorState here.
              const markdown = $convertToMarkdownString(TRANSFORMERS);
              onChange(markdown);
            });
          }}
        />
        <LinkPlugin />
        <ListPlugin />
      </LexicalComposer>
    </RichTextWrapper>
  );
};

Editor.propTypes = {
  id: PropTypes.string,
  content: PropTypes.string,
  onChange: PropTypes.func,
};
