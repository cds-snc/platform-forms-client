"use client";
import React, { useId, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import ContentEditable from "./ui/ContentEditable";
import TabControlPlugin from "./plugins/TabControlPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import { editorConfig } from "./config";
import { $createParagraphNode, $getRoot } from "lexical";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import "./styles.css";

interface EditorProps {
  id?: string;
  content?: string;
  showTreeview?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  lang?: string;

  onChange?(...args: unknown[]): unknown;
}

export const Editor = ({
  id,
  content = "",
  showTreeview = false,
  ariaLabel = "AriaLabel",
  ariaDescribedBy = "AriaDescribedBy",
  onChange,
}: EditorProps) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const randomId = useId();
  const editorId = id || `editor-${randomId}`;

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <LexicalComposer
      initialConfig={{
        ...editorConfig,
        editorState: () => {
          // @TODO: how to make this configurable
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
      <div>
        <ToolbarPlugin editorId={id || ""} />

        <RichTextPlugin
          contentEditable={
            <div className="gc-editor-container" ref={onRef}>
              <ContentEditable
                placeholder={""}
                id={editorId}
                ariaLabel={ariaLabel && ariaLabel}
                ariaDescribedBy={ariaDescribedBy && ariaDescribedBy}
              />
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        {showTreeview && <TreeViewPlugin />}
        <OnChangePlugin // @TODO: make the following configurable
          onChange={(editorState) => {
            editorState.read(() => {
              // Read the contents of the EditorState here.
              const markdown = $convertToMarkdownString(TRANSFORMERS);

              // Add two spaces to previous line for linebreaks (this is not handled properly by $convertToMarkdownString)
              const lines = markdown.split("\n");
              lines.forEach((currentLine, i) => {
                if (i > 0) {
                  const previousLine = lines[i - 1];
                  if (previousLine !== "" && currentLine !== "") {
                    lines[i - 1] = previousLine.trim() + "  ";
                  }
                }
              });
              onChange && onChange(lines.join("\n"));
            });
          }}
        />
        <ListPlugin />
        <LinkPlugin />
        <TabControlPlugin />
        <ListMaxIndentLevelPlugin maxDepth={5} />
        {floatingAnchorElem && (
          <>
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          </>
        )}
      </div>
    </LexicalComposer>
  );
};
