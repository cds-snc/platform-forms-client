import React, { useState } from "react";
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
import { TabEscape } from "./plugins/TabEscape";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import { t } from "i18next";

const RichTextWrapper = styled.div`
  height: 100%;

  .editor-input {
    padding: 20px;

    &:focus {
      outline: 2px #303fc3 solid;
    }

    p:first-child {
      margin-top: 0;
    }

    p {
      margin: 20px 0;
    }
  }
`;

export const Editor = ({
  content,
  onChange,
  autoFocusEditor,
}: {
  content: string;
  onChange: (value: string) => void;
  autoFocusEditor?: boolean;
}) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | undefined>(
    undefined
  );

  const editorId = "editor-" + Math.random().toString(36).substr(2, 9);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

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
        <Toolbar editorId={editorId} />
        <RichTextPlugin
          contentEditable={
            <div className="editor relative" ref={onRef}>
              <ContentEditable
                className="editor-input"
                id={editorId}
                ariaLabel={t("RichTextEditor")}
              />
            </div>
          }
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
        <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
        <ListPlugin />
        <TabEscape />
      </LexicalComposer>
    </RichTextWrapper>
  );
};

Editor.propTypes = {
  id: PropTypes.string,
  content: PropTypes.string,
  onChange: PropTypes.func,
};
