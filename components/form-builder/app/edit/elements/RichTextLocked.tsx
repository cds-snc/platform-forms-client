import React from "react";
import styled from "styled-components";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { RichTextEditor } from "./lexical-editor/RichTextEditor";
import { PanelActionsLocked } from "../PanelActionsLocked";
import { LocalizedElementProperties } from "../../../types";

const ElementWrapperDiv = styled.div`
  border: 1.5px solid #000000;
  max-width: 800px;
`;

export const RichTextLocked = ({
  beforeContent = null,
  addElement,
  children,
  initialValue,
  schemaProperty,
  ariaLabel,
}: {
  beforeContent?: React.ReactElement | null;
  addElement: boolean;
  children?: React.ReactElement;
  initialValue: string;
  schemaProperty: string;
  ariaLabel?: string;
}) => {
  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  return (
    <ElementWrapperDiv className="h-auto -mt-px first-of-type:rounded-t-md last-of-type:rounded-b-md">
      <div className="mx-7 mt-5 mb-7">
        {beforeContent && beforeContent}
        <div className="flex">{children}</div>
        <div className="flex border-2 rounded" key={translationLanguagePriority}>
          <RichTextEditor
            path={`form.${schemaProperty}.${localizeField(
              LocalizedElementProperties.DESCRIPTION,
              translationLanguagePriority
            )}`}
            content={initialValue}
            lang={translationLanguagePriority}
            autoFocusEditor={false}
            ariaLabel={ariaLabel}
          />
        </div>
      </div>
      <PanelActionsLocked addElement={addElement} />
    </ElementWrapperDiv>
  );
};
