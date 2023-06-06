import React, { useState, useRef, useEffect } from "react";

import { useTemplateStore } from "@formbuilder/store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

export const FileNameInput = () => {
  const { t } = useTranslation(["form-builder"]);
  const { updateField, getName } = useTemplateStore((s) => ({
    getName: s.getName,
    updateField: s.updateField,
  }));

  const fileName = getName();

  const [content, setContent] = useState(fileName);
  const [isEditing, setIsEditing] = useState(false);
  const [width, setWidth] = useState(0);
  const span = useRef<HTMLElement>(null);

  const { query } = useRouter();
  const focusFileName = query.focusFileName ? true : false;
  const fileNameInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // check if the fileName has changed from outside the component
    if (!isEditing && content === "" && fileName !== content) {
      setContent(fileName);
    }

    if (span?.current) {
      setWidth(span.current?.offsetWidth + 50);
    }
  }, [content, fileName, isEditing]);

  useEffect(() => {
    if (focusFileName) {
      fileNameInput && fileNameInput.current && fileNameInput.current?.focus();
    }
  }, [focusFileName]);

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
        className="px-2 py-1 min-w-[220px] max-w-[200px] laptop:min-w-[250px] laptop:max-w-[500px] border-2 border-white text-base font-bold hover:border-2 hover:border-gray-default text-ellipsis placeholder-slate-500"
        name="filename"
        placeholder={t("unnamedForm", { ns: "form-builder" })}
        value={content}
        onFocus={() => setIsEditing(true)}
        onBlur={() => {
          if (content !== getName()) {
            updateField(`name`, content);
          }
          setIsEditing(false);
        }}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
};
