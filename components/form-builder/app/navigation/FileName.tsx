import React, { useState, useRef, useEffect, useImperativeHandle } from "react";

import { useTemplateStore } from "@formbuilder/store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { useRefStore } from "@lib/hooks/useRefStore";
import { LocalizedFormProperties } from "@formbuilder/types";
import { useSpeechToText } from "@lib/hooks/useSpeechToText";

export const FileNameInput = () => {
  const { t } = useTranslation(["form-builder"]);
  const { updateField, getName, getIsPublished } = useTemplateStore((s) => ({
    getName: s.getName,
    updateField: s.updateField,
    getIsPublished: s.getIsPublished,
  }));

  const fileName = getName();
  const isPublished = getIsPublished();

  const [content, setContent] = useState(fileName);
  const [isEditing, setIsEditing] = useState(false);
  const [isInitialFocus, setIsInitialFocus] = useState(false);
  const [width, setWidth] = useState(0);
  const span = useRef<HTMLElement>(null);

  const fileNameInput = useRef<HTMLInputElement>(null);
  const remoteRef = useRef<HTMLInputElement>(null);
  const { setRef, removeRef } = useRefStore();

  const { title } = useTemplateStore((s) => ({
    title:
      s.form[s.localizeField(LocalizedFormProperties.TITLE, s.translationLanguagePriority)] ?? "",
  }));

  //
  // Error "uncaught ReferenceError: webkitSpeechRecognition is not defined"
  // Is this rendered on the Server statically?
  //
  // useSpeechToText({elRef: fileNameInput});
  //

  useEffect(() => {
    setRef("fileNameInput", remoteRef);

    return () => {
      removeRef("fileNameInput");
    };
  }, [remoteRef, setRef, removeRef]);

  // React Hook that lets you customize the handle exposed as a ref
  // In this case we are only exposing the focus and select function
  useImperativeHandle(
    remoteRef,
    () => {
      return {
        focus() {
          fileNameInput.current?.focus();
        },
        select(): void {
          fileNameInput.current?.select();
        },
      } as HTMLInputElement;
    },
    [fileNameInput]
  );

  useEffect(() => {
    if (isEditing && isInitialFocus && fileNameInput.current?.value === "") {
      setContent(title);

      setTimeout(() => {
        fileNameInput.current?.select();
      }, 50);

      setIsInitialFocus(false);
    }
  }, [isEditing, isInitialFocus, title]);

  useEffect(() => {
    // check if the fileName has changed from outside the component
    if (!isEditing && content === "" && fileName !== content) {
      setContent(fileName);
    }

    if (span?.current) {
      setWidth(span.current?.offsetWidth + 50);
    }
  }, [content, fileName, isEditing]);

  const widthStyle = width ? { width: `${width}px` } : {};

  return (
    <div className="flex py-2">
      <span className={`px-2 invisible absolute`} ref={span}>
        {content}
      </span>
      <input
        id="fileName"
        style={widthStyle}
        ref={fileNameInput}
        className={
          "px-2 py-1 min-w-[220px] max-w-[200px] laptop:min-w-[250px] laptop:max-w-[500px] border-2 border-white text-base font-bold text-ellipsis placeholder-slate-500" +
          (!isPublished && " hover:border-2 hover:border-gray-default")
        }
        name="filename"
        placeholder={t("unnamedForm", { ns: "form-builder" })}
        value={content}
        onFocus={() => {
          setIsEditing(true), setIsInitialFocus(true);
        }}
        onBlur={() => {
          if (content !== getName()) {
            updateField(`name`, content);
          }
          setIsEditing(false);
        }}
        onChange={(e) => setContent(e.target.value)}
        aria-label={t("formName", { ns: "form-builder" })}
        disabled={isPublished && true}
      />
    </div>
  );
};
