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
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import "./styles.css";
import { LINE_BREAK_FIX } from "./transformers";
import translations, { Language } from "./i18n";
import { LocaleProvider } from "./hooks/useLocale";

interface EditorProps {
  id?: string;
  content?: string;
  showTreeview?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  locale?: string;

  onChange?(...args: unknown[]): unknown;
}

export const Editor = ({
  id,
  content = "",
  showTreeview = false,
  ariaLabel = "AriaLabel",
  ariaDescribedBy = "AriaDescribedBy",
  onChange,
  locale = "en",
}: EditorProps) => {
  if (!translations[locale as Language]) {
    // If the locale is not found, default to English
    // should we throw exception?
    locale = "en";
  }

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
    <LocaleProvider initialLocale={locale as Language}>
      <LexicalComposer
        initialConfig={{
          ...editorConfig,
          editorState: () => {
            $convertFromMarkdownString(content, [...TRANSFORMERS]);
          },
        }}
      >
        <div>
          <ToolbarPlugin editorId={editorId} setIsLinkEditMode={setIsLinkEditMode} />

          <RichTextPlugin
            contentEditable={
              <div className="gc-editor-container" ref={onRef}>
                <ContentEditable
                  placeholder={""}
                  id={editorId}
                  ariaLabel={ariaLabel}
                  ariaDescribedBy={ariaDescribedBy}
                />
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          {showTreeview && <TreeViewPlugin />}
          <OnChangePlugin
            onChange={(editorState) => {
              editorState.read(() => {
                const markdown = $convertToMarkdownString([...TRANSFORMERS, LINE_BREAK_FIX]);
                onChange && onChange(markdown);
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
    </LocaleProvider>
  );
};
