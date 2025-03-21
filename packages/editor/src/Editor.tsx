import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import basicTheme from "./themes/BasicTheme";
import ContentEditable from "./ui/ContentEditable";
import TabControlPlugin from "./plugins/TabControlPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ListMaxIndentLevelPlugin from "./plugins/ListMaxIndentPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import { useState } from "react";

const editorConfig = {
  theme: basicTheme,

  onError(error: Error) {
    throw error;
  },

  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, AutoLinkNode, LinkNode],

  namespace: "MyEditorNamespace",
};

export const Editor = () => {
  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  return (
    <div className="rich-text-wrapper gc-formview">
      <LexicalComposer initialConfig={editorConfig}>
        <div className="editor-container">
          <ToolbarPlugin editorId={""} />

          <RichTextPlugin
            contentEditable={
              <div className="editor" ref={onRef}>
                <ContentEditable placeholder={""} />
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <TreeViewPlugin />
          <AutoFocusPlugin />
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
    </div>
  );
};
