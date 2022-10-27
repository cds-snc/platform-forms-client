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

export const RichTextLocked = ({
  beforeContent = null,
  addElement,
  children,
  initialValue,
  schemaProperty,
}: {
  beforeContent?: React.ReactElement | null;
  addElement: boolean;
  children?: React.ReactElement;
  initialValue: string;
  schemaProperty: string;
}) => {
  const { localizeField, lang } = useTemplateStore();

  return (
    <ElementWrapperDiv>
      {beforeContent && beforeContent}
      <div className="flex mt-6 mx-7">{children}</div>
      <div className="flex">
        <RichTextEditor
          path={`form.${schemaProperty}.${localizeField(LocalizedElementProperties.DESCRIPTION)}`}
          content={initialValue}
          lang={lang}
          autoFocusEditor={false}
        />
      </div>
      <PanelActionsLocked addElement={addElement} />
    </ElementWrapperDiv>
  );
};
