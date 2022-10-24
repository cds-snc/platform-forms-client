import React from "react";
import { Editor } from "./Editor";
import useTemplateStore from "../store/useTemplateStore";
import styled from "styled-components";

const EditorWrapper = styled.div`
  width: 100%;

  .editor-list-ol {
    padding-left: 20px;
  }
`;

export const RichTextEditor = ({ path, content }: { path: string; content: string }) => {
  const { updateField, lang } = useTemplateStore();
  const handleChange = (value: string) => {
    if (typeof value === "undefined") {
      value = "";
    }

    updateField(path, value);
  };

  return (
    <EditorWrapper key={lang}>
      <Editor content={content} onChange={handleChange} />
    </EditorWrapper>
  );
};
