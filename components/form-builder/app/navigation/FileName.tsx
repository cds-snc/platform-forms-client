import React, { useState, useRef, useEffect, useImperativeHandle } from "react";

import { useTemplateStore } from "@formbuilder/store/useTemplateStore";
import { useTranslation } from "next-i18next";
import { logMessage } from "@lib/logger";
import { useRefStore } from "@lib/hooks/useRefStore";

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

  const fileNameInput = useRef<HTMLInputElement>(null);
  const remoteRef = useRef<HTMLInputElement>(null);
  const { setRef, removeRef } = useRefStore();

  useEffect(() => {
    setRef("fileNameInput", remoteRef);

    return () => {
      removeRef("fileNameInput");
    };
  }, [remoteRef, setRef, removeRef]);

  useImperativeHandle(
    remoteRef,
    () => {
      return {
        focus() {
          fileNameInput.current?.focus();
          logMessage.debug("Calling focus function on fileNameInput");
        },
      } as HTMLInputElement;
    },
    [fileNameInput]
  );

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
