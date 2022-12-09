import React from "react";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { RichTextEditor } from "./lexical-editor/RichTextEditor";
import { PanelActionsLocked } from "../PanelActionsLocked";
import { LocalizedElementProperties } from "../../../types";

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
    <div className="max-w-[800px] border-1 border-black h-auto -mt-px first-of-type:rounded-t-md last-of-type:rounded-b-md">
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
    </div>
  );
};
