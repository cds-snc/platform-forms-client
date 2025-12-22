"use client";
import React, { useState, useRef, useEffect, useImperativeHandle } from "react";
import { cn } from "@lib/utils";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useTranslation } from "@i18n/client";
import { useRefStore } from "@lib/hooks/form-builder/useRefStore";
import { LocalizedFormProperties } from "@lib/types/form-builder-types";

export const FileNameInput = () => {
  const { t } = useTranslation(["form-builder"]);
  const { updateField, getName, getIsPublished } = useTemplateStore((s) => ({
    getName: s.getName,
    updateField: s.updateField,
    getIsPublished: s.getIsPublished,
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
          "border-1 border-[#1B00C2] rounded-md px-2 py-1 min-w-[220px] max-w-[200px] laptop:min-w-[250px] laptop:max-w-[500px] text-base font-bold text-ellipsis placeholder-slate-500 mt-3",
          !isPublished && "hover:border-1 hover:border-gray-default"
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
            setHasManuallyEdited(true);
          }
        }}
        onChange={(e) => {
          setManualContent(e.target.value);
          setHasManuallyEdited(true);
        }}
        aria-label={t("formName", { ns: "form-builder" })}
        disabled={isPublished && true}
      />
    </div>
  );
};
