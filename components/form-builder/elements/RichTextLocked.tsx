import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../plate-editor/RichTextEditor";
import { serializeMd } from "../plate-editor/helpers/markdown";
import { deserializeMd } from "@udecode/plate";
import { PanelActionsLocked } from "../panel/PanelActionsLocked";
import { LocalizedElementProperties } from "../types";
import { MyValue, useMyPlateEditorRef } from "../plate-editor/types";

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
  margin: 0px 20px 10px;

  & h3 {
    margin-top: 30px;
    margin-bottom: 0;
  }
`;

const OptionWrapper = styled.div`
  display: flex;
  margin: 0 20px;
`;

export const RichTextLocked = ({
  addElement,
  children,
  initialValue,
  schemaProperty,
}: {
  addElement: boolean;
  children?: React.ReactElement;
  initialValue: string;
  schemaProperty: string;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const { localizeField, updateField } = useTemplateStore();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const editor = useMyPlateEditorRef()!;

  // const [value, setValue] = useState<Descendant[]>(initialValue);
  const [value, setValue] = useState(deserializeMd(editor, initialValue));

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  const onChange = (value: MyValue) => {
    let serialized = serializeMd(value);

    if (typeof serialized === "undefined") {
      serialized = "";
    }

    setValue(value);

    updateField(
      `form.${schemaProperty}.${localizeField(LocalizedElementProperties.DESCRIPTION)}`,
      serialized
    );
  };

  return (
    <ElementWrapperDiv>
      <ContentWrapper>{children}</ContentWrapper>
      <OptionWrapper>
        <RichTextEditor value={value} onChange={onChange} />
      </OptionWrapper>
      <PanelActionsLocked addElement={addElement} />
    </ElementWrapperDiv>
  );
};
