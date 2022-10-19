import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { LocalizedElementProperties } from "../types";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const input = useRef<HTMLInputElement>(null);
  const editorId = `${parentIndex}-editor`;

  const { localizeField, updateField, form } = useTemplateStore();

  const value =
    form.elements[parentIndex].properties[localizeField(LocalizedElementProperties.DESCRIPTION)];

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
  const handleChange = (value = "") => {
    updateField(
      `form.elements[${parentIndex}].properties.${localizeField(
        LocalizedElementProperties.DESCRIPTION
      )}`,
      value
    );
  };

  return (
    <OptionWrapper>
      <RichTextEditor id={editorId} value={value} onChange={handleChange} />
    </OptionWrapper>
  );
};
