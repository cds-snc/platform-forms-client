import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { LocalizedElementProperties } from "../types";

const OptionWrapper = styled.div`
  display: flex;
`;

export const RichText = ({ parentIndex }: { parentIndex: number }) => {
  const { localizeField, form, lang } = useTemplateStore();

  const content =
    form.elements[parentIndex].properties[localizeField(LocalizedElementProperties.DESCRIPTION)];

  return (
    <OptionWrapper>
      <RichTextEditor
        autoFocusEditor={true}
        path={`form.elements[${parentIndex}].properties.${localizeField(
          LocalizedElementProperties.DESCRIPTION
        )}`}
        content={content}
        lang={lang}
      />
    </OptionWrapper>
  );
};
