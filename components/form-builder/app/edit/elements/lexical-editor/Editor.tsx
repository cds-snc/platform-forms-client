import React, { useState } from "react";
import PropTypes from "prop-types";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
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
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import { TabEscape } from "./plugins/TabEscape";
import ListMaxIndentPlugin from "./plugins/ListMaxIndentPlugin";

export const Editor = ({
  content,
  onChange,
  autoFocusEditor,
  ariaLabel,
  ariaDescribedBy,
  lang,
}: {
  content: string;
  onChange: (value: string) => void;
  autoFocusEditor?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  lang?: string;
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
    <div className="rich-text-wrapper">
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
            <div className="editor relative" ref={onRef} {...(lang && { lang: lang })}>
              <ContentEditable
                className="editor-input focus:outline-blue-focus"
                id={editorId}
                ariaLabel={ariaLabel && ariaLabel}
                ariaDescribedBy={ariaDescribedBy && ariaDescribedBy}
              />
            </div>
          }
          placeholder={""}
        />
        <FocusPlugin autoFocusEditor={autoFocusEditor} />
        <HistoryPlugin />
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
        <ListMaxIndentPlugin maxDepth={5} />
      </LexicalComposer>
    </div>
  );
};

Editor.propTypes = {
  id: PropTypes.string,
  content: PropTypes.string,
  onChange: PropTypes.func,
};
