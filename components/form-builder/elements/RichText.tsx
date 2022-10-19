import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { useMyPlateEditorRef } from "../plate-editor/types";

/*
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';
*/

// https://socket.dev/npm/package/@lexical/markdown

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const editorId = `${parentIndex}-editor`;
  const editor = useMyPlateEditorRef(editorId);

  const { localizeField, updateField, form } = useTemplateStore();

  const [value, setValue] = useState("");

  // LexicalAutoLinkPlugin

  /*
  const [value, setValue] = useState(
    form.elements[parentIndex].properties[localizeField(LocalizedElementProperties.DESCRIPTION)]
      ? deserializeMd(
        editor,
        form.elements[parentIndex].properties[
        localizeField(LocalizedElementProperties.DESCRIPTION)
        ]
      )
      : [{ children: [{ text: "" }] }]
  );
  */

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
  const handleChange = (value: string = "") => {
    /*
    let serialized = serializeMd(value);

    if (typeof serialized === "undefined") {
      serialized = "";
    }

    setValue(value);
    updateField(
      `form.elements[${parentIndex}].properties.${localizeField(
        LocalizedElementProperties.DESCRIPTION
      )}`,
      serialized
    );
    */
  };

  return (
    <OptionWrapper>
      <RichTextEditor id={editorId} value={value} onChange={handleChange} />
    </OptionWrapper>
  );
};
