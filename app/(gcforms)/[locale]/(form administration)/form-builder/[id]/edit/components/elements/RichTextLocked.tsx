"use client";
import React from "react";
import { useTemplateStore } from "@clientComponents/form-builder/store/useTemplateStore";
import { RichTextEditor } from "./lexical-editor/RichTextEditor";
import { AddElementButton } from "./element-dialog/AddElementButton";
import { LocalizedElementProperties } from "@clientComponents/form-builder/types";
import { LockedBadge } from "@clientComponents/form-builder/app/shared/LockedBadge";
import { useHandleAdd } from "@clientComponents/form-builder/hooks";
import { FormElementTypes } from "@lib/types";
import { cn } from "@lib/utils";

export const RichTextLocked = ({
  beforeContent = null,
  addElement,
  children,
  schemaProperty,
  ariaLabel,
  className,
}: {
  beforeContent?: React.ReactElement | null;
  addElement: boolean;
  children?: React.ReactElement;
  schemaProperty: "introduction" | "privacyPolicy" | "confirmation";
  ariaLabel?: string;
  className?: string;
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
    <div
      className={cn(
        "-mt-px h-auto max-w-[800px] border-1 border-slate-500 bg-white last-of-type:rounded-b-lg",
        className
      )}
    >
      <div className="mx-5 mb-7 mt-5">
        <LockedBadge />
        {beforeContent && beforeContent}
        <div className="flex">{children}</div>
        <div key={translationLanguagePriority} className="flex rounded border-2">
          <RichTextEditor
            path={path}
            content={content}
            lang={translationLanguagePriority}
            ariaLabel={ariaLabel}
          />
        </div>
      </div>
      <div className="flex">
        {addElement && (
          <div className="bottom-0 z-10 mx-auto -mb-5">
            <AddElementButton
              handleAdd={(type?: FormElementTypes) => {
                // Index is -1 because we want to add the element after the initial locked block and before the first element
                handleAddElement(-1, type);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
