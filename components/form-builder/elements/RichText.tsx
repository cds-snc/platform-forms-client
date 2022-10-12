import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
// import { RichTextEditor } from "../plate-editor/RichTextEditor";
import { deserializeMd, Value } from "@udecode/plate";
import { useMyPlateEditorRef } from "../plate-editor/types";
import { serializeMd } from "../plate-editor/helpers/markdown";
import { LocalizedElementProperties } from "../types";
import RichTextEditor from "../ck-editor/RichTextEditor";
import { logMessage } from "@lib/logger";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const editorId = `${parentIndex}-editor`;
  const editor = useMyPlateEditorRef(editorId);

  const { localizeField, updateField, form } = useTemplateStore();

  const [value, setValue] = useState(
    form.elements[parentIndex].properties[localizeField(LocalizedElementProperties.DESCRIPTION)] ||
      ""
  );

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  /**
   * Serialize the contents of the Editor to Markdown and save
   * to the datastore.
   *
   * @param value
   */
  const handleChange = (event, editor) => {
    let serialized = editor.getData();
    logMessage.info(serialized);

    if (typeof serialized === "undefined") {
      serialized = "";
    }

    setValue(serialized);
    updateField(
      `form.elements[${parentIndex}].properties.${localizeField(
        LocalizedElementProperties.DESCRIPTION
      )}`,
      serialized
    );
  };

  return (
    <OptionWrapper>
      <RichTextEditor value={value} onChange={handleChange} />
      {/* <RichTextEditor id={editorId} value={value} onChange={handleChange} /> */}
    </OptionWrapper>
  );
};
