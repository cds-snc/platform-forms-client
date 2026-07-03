"use client";
import React, { useState, useRef, useEffect, useImperativeHandle } from "react";
import { cn } from "@lib/utils";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTranslation } from "@i18n/client";
import { useRefStore } from "@lib/hooks/form-builder/useRefStore";
import { LocalizedFormProperties } from "@lib/types/form-builder-types";

export const FileNameInput = ({
  templateVersioningEnabled,
}: {
  templateVersioningEnabled: boolean;
}) => {
  const { t } = useTranslation(["form-builder", "my-forms"]);
  const { updateField, getName, getIsPublished, currentDraftVersionId, versionNumber } =
    useTemplateStore((s) => ({
      getName: s.getName,
      updateField: s.updateField,
      getIsPublished: s.getIsPublished,
      currentDraftVersionId: s.currentDraftVersionId,
      versionNumber: s.versionNumber,
    }));

  const fileName = getName();
  const isPublished = getIsPublished();

  const { title } = useTemplateStore((s) => ({
    title:
      s.form[s.localizeField(LocalizedFormProperties.TITLE, s.translationLanguagePriority)] ?? "",
  }));

  // Use title if fileName is empty
  const displayValue = fileName || title;
  const [manualContent, setManualContent] = useState("");
  const [hasManuallyEdited, setHasManuallyEdited] = useState(false);
  const [width, setWidth] = useState(0);
  const span = useRef<HTMLElement | null>(null);

  // Derive content: use manual content if edited, otherwise use displayValue
  const content = hasManuallyEdited ? manualContent : displayValue;

  // Callback ref to measure span width whenever it updates
  const spanRef = (node: HTMLElement | null) => {
    span.current = node;
    if (node) {
      const newWidth = node.offsetWidth + 50;
      if (newWidth !== width) {
        setWidth(newWidth);
      }
    }
  };

  const fileNameInput = useRef<HTMLInputElement | null>(null);
  const remoteRef = useRef<HTMLInputElement | null>(null);
  const { setRef, removeRef } = useRefStore();

  useEffect(() => {
    setRef("fileNameInput", remoteRef as React.RefObject<HTMLElement>);

    return () => {
      removeRef("fileNameInput");
    };
  }, [remoteRef, setRef, removeRef]);

  // React Hook that lets you customize the handle exposed as a ref
  // In this case we are only exposing the focus and select function
  useImperativeHandle(remoteRef, () => {
    return {
      focus() {
        fileNameInput.current?.focus();
      },
      select(): void {
        fileNameInput.current?.select();
      },
    } as HTMLInputElement;
  }, [fileNameInput]);

  const widthStyle = width ? { width: `${width}px` } : {};

  return (
    <div className="border-gcds-blue-800">
      <span className={`invisible absolute px-2`} ref={spanRef}>
        {content}
      </span>
      <input
        id="fileName"
        style={widthStyle}
        ref={fileNameInput}
        className={cn(
          "laptop:min-w-62.5 laptop:max-w-[500px] mt-3 mr-2 max-w-[200px] min-w-55 rounded-md border-1 border-[#1B00C2] px-2 py-1 text-base font-bold text-ellipsis placeholder-slate-500",
          !isPublished && "hover:border-gray-default hover:border-1"
        )}
        name="filename"
        placeholder={t("unnamedForm", { ns: "form-builder" })}
        value={content}
        onFocus={() => {
          if (content === "") {
            setManualContent(title);
          }
          setTimeout(() => {
            fileNameInput.current?.select();
          }, 50);
        }}
        onBlur={() => {
          if (content !== getName()) {
            updateField(`name`, content);
          }
        }}
        onChange={(e) => {
          setManualContent(e.target.value);
          setHasManuallyEdited(true);
        }}
        aria-label={t("formName", { ns: "form-builder" })}
        disabled={isPublished && !currentDraftVersionId && true}
      />

      {templateVersioningEnabled && currentDraftVersionId && versionNumber && (
        <div
          data-draft-id={currentDraftVersionId}
          className="inline-block self-start rounded border-solid border-yellow-700 bg-yellow-300 p-1 px-2 text-sm"
        >
          {t("card.states.draft", { ns: "my-forms" })} - {t("version", { ns: "my-forms" })}{" "}
          {versionNumber}
        </div>
      )}
    </div>
  );
};
