import React from "react";
import { useTemplateStore } from "../../../store/useTemplateStore";
import { RichTextEditor } from "./lexical-editor/RichTextEditor";
import { AddElementButton } from "./element-dialog/AddElementButton";
import { LocalizedElementProperties } from "../../../types";
import { LockedBadge } from "../../shared/LockedBadge";
import { useHandleAdd } from "@components/form-builder/hooks";

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
  schemaProperty: "introduction" | "privacyPolicy" | "confirmation";
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

  const { handleAddElement } = useHandleAdd();

  return (
    <div className="max-w-[800px] border-1 border-black h-auto -mt-px x-[10000] first-of-type:rounded-t-md last-of-type:rounded-b-md">
      <div className="mx-7 mt-5 mb-7">
        <LockedBadge />
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
      <div className="flex">
        {addElement && (
          <div className="mx-auto bottom-0 -mb-5 z-10">
            <AddElementButton position={-1} handleAdd={handleAddElement} />
          </div>
        )}
      </div>
    </div>
  );
};
