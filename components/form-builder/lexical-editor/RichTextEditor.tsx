import React from "react";
import { Editor } from "./Editor";
import useTemplateStore from "../store/useTemplateStore";
import styled from "styled-components";

const EditorWrapper = styled.div`
  width: 100%;
`;

export const RichTextEditor = ({
  path,
  content,
  autoFocusEditor,
}: {
  path: string;
  content: string;
  autoFocusEditor: boolean;
}) => {
  const { updateField, lang } = useTemplateStore();
  const handleChange = (value: string) => {
    if (typeof value === "undefined") {
      value = "";
    }
    updateField(path, value);
  };

  return (
    <EditorWrapper key={lang}>
      <Editor autoFocusEditor={autoFocusEditor} content={content} onChange={handleChange} />
    </EditorWrapper>
  );
};
