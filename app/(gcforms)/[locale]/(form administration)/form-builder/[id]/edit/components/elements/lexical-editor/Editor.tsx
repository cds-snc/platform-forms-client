"use client";
import React, { useState, useId } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { $createParagraphNode, $getRoot } from "lexical";
import { editorConfig } from "./config";
import { Toolbar } from "./Toolbar";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import dynamic from "next/dynamic";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";

const FloatingLinkEditorPlugin = dynamic(() => import("./plugins/FloatingLinkEditorPlugin"), {
  ssr: false,
});
const ListMaxIndentPlugin = dynamic(() => import("./plugins/ListMaxIndentPlugin"), { ssr: false });

interface EditorProps {
  id?: string;
  content?: string;
  onChange?(...args: unknown[]): unknown;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  lang?: string;
}

export const Editor = ({ content, onChange, ariaLabel, ariaDescribedBy, lang }: EditorProps) => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | undefined>(
    undefined
  );

  const editorId = "editor-" + useId();

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  if (typeof content !== "string") {
    content = "";
  }

  return (
    <div className="rich-text-wrapper gc-formview">
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
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <OnChangePlugin
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
        <LinkPlugin />
        <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
        <ListPlugin />
        <ListMaxIndentPlugin maxDepth={5} />
      </LexicalComposer>
    </div>
  );
};
