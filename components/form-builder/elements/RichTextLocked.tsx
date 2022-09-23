import React, { useRef, useEffect, useState } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../editor/RichTextEditor";
import { Descendant } from "slate";
import { serialize } from "../editor/Markdown";
import { PanelActionsLocked } from "../panel/PanelActionsLocked";

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
  margin: 30px 20px 10px;
  & div {
    width: 100%;
    margin-bottom: 20px;
  }
`;

export const RichTextLocked = ({
  addElement,
  children,
  initialValue,
  schemaProperty,
}: {
  addElement: boolean;
  children?: React.ReactElement;
  initialValue: Descendant[];
  schemaProperty: string;
}) => {
  const input = useRef<HTMLInputElement>(null);
  const { localizeField, updateField } = useTemplateStore();
  const [value, setValue] = useState<Descendant[]>(initialValue);

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  const onChange = (value: string) => {
    const parsed = JSON.parse(value);
    const serialized = serialize({ children: parsed });
    setValue(parsed);
    updateField(`form.${schemaProperty}.${localizeField("description")}`, serialized);
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
