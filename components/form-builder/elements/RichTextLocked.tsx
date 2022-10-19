import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { serializeMd } from "../plate-editor/helpers/markdown";
import { deserializeMd, Value } from "@udecode/plate";
import { PanelActionsLocked } from "../panel/PanelActionsLocked";
import { LocalizedElementProperties } from "../types";
import { useMyPlateEditorRef } from "../plate-editor/types";

const ElementWrapperDiv = styled.div`
  border: 1.5px solid #000000;
  padding-top: 10px;
  position: relative;
  max-width: 800px;
  height: auto;
  margin-top: -1px;
`;

const ContentWrapper = styled.div`
  display: flex;
  margin: 0px 20px;

  & h2 {
    font-size: 26px;
    line-height: 32px;
    margin-top: 15px;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const OptionWrapper = styled.div`
  display: flex;
  margin: 0 26px;
`;

export const RichTextLocked = ({
  id,
  addElement,
  children,
  initialValue,
  schemaProperty,
  "aria-label": ariaLabel = undefined,
}: {
  id: string;
  addElement: boolean;
  children?: React.ReactElement;
  initialValue: string;
  schemaProperty: string;
  "aria-label"?: string;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const { localizeField, updateField } = useTemplateStore();
  const editorId = `${id}-editor`;
  const editor = useMyPlateEditorRef();

  const [value, setValue] = useState(
    initialValue ? deserializeMd(editor, initialValue) : [{ children: [{ text: "" }] }]
  );

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  const onChange = (value: string) => {
    /*
    let serialized = serializeMd(value);

    if (typeof serialized === "undefined") {
      serialized = "";
    }

    setValue(value);

    updateField(
      `form.${schemaProperty}.${localizeField(LocalizedElementProperties.DESCRIPTION)}`,
      serialized
    );
    */
  };

  return (
    <ElementWrapperDiv>
      <ContentWrapper>{children}</ContentWrapper>
      <OptionWrapper>
        <RichTextEditor id={editorId} value={value} onChange={onChange} aria-label={ariaLabel} />
      </OptionWrapper>
      <PanelActionsLocked addElement={addElement} />
    </ElementWrapperDiv>
  );
};
