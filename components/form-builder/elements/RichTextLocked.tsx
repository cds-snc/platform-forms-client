import React, { useRef, useEffect } from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { PanelActionsLocked } from "../panel/PanelActionsLocked";
import { Language, LocalizedElementProperties } from "../types";
import { useTranslation } from "next-i18next";

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
  const { localizeField } = useTemplateStore();

  useEffect(() => {
    if (input.current) {
      input.current.focus();
    }
  }, []);

  return (
    <ElementWrapperDiv>
      <ContentWrapper>{children}</ContentWrapper>
      <OptionWrapper>
        <RichTextEditor
          path={`form.${schemaProperty}.${localizeField(LocalizedElementProperties.DESCRIPTION)}`}
          content={initialValue}
        />
      </OptionWrapper>
      <PanelActionsLocked addElement={addElement} />
    </ElementWrapperDiv>
  );
};
