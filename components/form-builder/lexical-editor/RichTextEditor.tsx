import React from "react";
import { Editor } from "./Editor";
import useTemplateStore from "../store/useTemplateStore";
import styled from "styled-components";
import { Language } from "../types";

const EditorWrapper = styled.div`
  width: 100%;
`;

export const RichTextEditor = ({
  path,
  content,
  autoFocusEditor,
  lang,
}: {
  path: string;
  content: string;
  autoFocusEditor?: boolean;
  lang: Language;
}) => {
  const { updateField } = useTemplateStore();
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
