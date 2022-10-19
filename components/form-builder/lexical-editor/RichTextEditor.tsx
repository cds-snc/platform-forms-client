import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { editorConfig } from "./config";
import { Toolbar } from "./Toolbar";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import ToolbarPlugin from "./plugins/FloatingLinkEditor";

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

export const RichTextEditor = ({
  id,
  value,
  onChange,
  "aria-label": ariaLabel = undefined,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  "aria-label"?: string;
}) => {
  return (
    <RichTextWrapper style={{ width: "100%" }}>
      <LexicalComposer initialConfig={editorConfig}>
        <Toolbar />
        <ToolbarPlugin />
        <RichTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<Placeholder> Enter some rich text...</Placeholder>}
        />
        <TreeViewPlugin />
        <LinkPlugin />

        {/* <OnChangePlugin onChange={onChange} /> */}
      </LexicalComposer>
    </RichTextWrapper>
  );
};

RichTextEditor.propTypes = {
  id: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
