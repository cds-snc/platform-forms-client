import React, { useState } from "react";
import { useMyPlateEditorRef } from "../plate-editor/types";
import { Language } from "../types";
import { serializeMd } from "../plate-editor/helpers/markdown";
import { deserializeMd, Value } from "@udecode/plate";
import { RichTextEditor } from "../plate-editor/RichTextEditor";
import useTemplateStore from "../store/useTemplateStore";
import styled from "styled-components";

const EditorWrapper = styled.div`
  display: flex;
  .slate-HeadingToolbar {
    margin: 0;
  }
`;

export const Editor = ({
  path,
  content,
  index,
  language,
}: {
  path: string;
  content: string;
  index: string;
  language: Language;
}) => {
  const { updateField } = useTemplateStore();

  const editorId = `${index}-editor-${language}`;
  const editor = useMyPlateEditorRef(editorId);

  const [value, setValue] = useState(
    content ? deserializeMd(editor, content) : [{ children: [{ text: "" }] }]
  );

  const handleChange = (value: Value) => {
    let serialized = serializeMd(value);

    if (typeof serialized === "undefined") {
      serialized = "";
    }

    setValue(value);
    updateField(path, serialized);
  };

  return (
    <EditorWrapper>
      <RichTextEditor id={editorId} value={value} onChange={handleChange} />
    </EditorWrapper>
  );
};
