import React from "react";
import styled from "styled-components";
import useTemplateStore from "../store/useTemplateStore";
import { RichTextEditor } from "../lexical-editor/RichTextEditor";
import { PanelActionsLocked } from "../panel/PanelActionsLocked";
import { LocalizedElementProperties } from "../types";

const ElementWrapperDiv = styled.div`
  border: 1.5px solid #000000;
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
    margin-bottom: 10px;
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
  const { localizeField, lang } = useTemplateStore();

  return (
    <ElementWrapperDiv>
      <ContentWrapper>{children}</ContentWrapper>
      <OptionWrapper>
        <RichTextEditor
          path={`form.${schemaProperty}.${localizeField(LocalizedElementProperties.DESCRIPTION)}`}
          content={initialValue}
          lang={lang}
        />
      </OptionWrapper>
      <PanelActionsLocked addElement={addElement} />
    </ElementWrapperDiv>
  );
};
