import React from "react";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { RichTextEditor } from "./lexical-editor/RichTextEditor";
import { PanelActionsLocked } from "../PanelActionsLocked";
import { LocalizedElementProperties } from "../../../types";

export const RichTextLocked = ({
  beforeContent = null,
  addElement,
  children,
  schemaProperty,
  ariaLabel,
}: {
  beforeContent?: React.ReactElement | null;
  addElement: boolean;
  children?: React.ReactElement;
  schemaProperty: "introduction" | "endPage" | "privacyPolicy";
  ariaLabel?: string;
}) => {
  const { localizeField, form, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    form: s.form,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const localizedField = localizeField(
    LocalizedElementProperties.DESCRIPTION,
    translationLanguagePriority
  );

  const content = form[schemaProperty]?.[localizedField] ?? "";

  const path = `form.${schemaProperty}[${localizedField}]]`;

  return (
    <div className="max-w-[800px] border-1 border-black h-auto -mt-px first-of-type:rounded-t-md last-of-type:rounded-b-md">
      <div className="mx-7 mt-5 mb-7">
        {beforeContent && beforeContent}
        <div className="flex">{children}</div>
        <div key={translationLanguagePriority} className="flex border-2 rounded">
          <RichTextEditor
            path={path}
            content={content}
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
