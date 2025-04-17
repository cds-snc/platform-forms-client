"use client";
import React, { useId, useState } from "react";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";

import ContentEditable from "./ui/ContentEditable";
import TabControlPlugin from "./plugins/TabControlPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import { editorConfig } from "./config";
import { LINE_BREAK_FIX } from "./transformers";
import { Language } from "./i18n";
import { LocaleContext } from "./context/LocaleContext";

import "./styles.css";
import { ToolbarContext } from "./context/ToolbarContext";
import ShortcutsPlugin from "./plugins/ShortcutsPlugin";
import { MaxLengthPlugin } from "./plugins/MaxLengthPlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";

interface EditorProps {
  id?: string;
  content?: string;
  showTreeview?: boolean;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  locale?: string;
  contentLocale?: string;
  className?: string;
  maxLength?: number;
  enableDraggableBlocks?: boolean;

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
  contentLocale = "en",
  className,
  maxLength,
  enableDraggableBlocks = false,
}: EditorProps) => {
  contentLocale = contentLocale || locale;

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
    <LocaleContext initialLocale={locale as Language}>
      <ToolbarContext>
        <LexicalComposer
          initialConfig={{
            ...editorConfig,
            editorState: () => {
              $convertFromMarkdownString(content, [...TRANSFORMERS]);
            },
          }}
        >
          <div className="gc-editor-container">
            <ToolbarPlugin editorId={editorId} setIsLinkEditMode={setIsLinkEditMode} />
            <ShortcutsPlugin setIsLinkEditMode={setIsLinkEditMode} />
            <RichTextPlugin
              contentEditable={
                <div
                  className="gc-editor-container"
                  ref={onRef}
                  {...(contentLocale && { lang: contentLocale })}
                >
                  <ContentEditable
                    className={className || ""}
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
                {enableDraggableBlocks && <DraggableBlockPlugin anchorElem={floatingAnchorElem} />}
              </>
            )}
            {maxLength && (
              <>
                <MaxLengthPlugin maxLength={maxLength} />
              </>
            )}
          </div>
        </LexicalComposer>
      </ToolbarContext>
    </LocaleContext>
  );
};
