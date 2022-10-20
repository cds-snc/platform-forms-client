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

  const { localizeField, form } = useTemplateStore();

  const value =
    form.elements[parentIndex].properties[localizeField(LocalizedElementProperties.DESCRIPTION)];

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  return (
    <OptionWrapper>
      <RichTextEditor
        path={`form.elements[${parentIndex}].properties.${localizeField(
          LocalizedElementProperties.DESCRIPTION
        )}`}
        content={value}
      />
    </OptionWrapper>
  );
};
