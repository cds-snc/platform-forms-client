import React, { useState, useRef, useEffect } from "react";

import { useTemplateStore } from "@formbuilder/store/useTemplateStore";
import { useTranslation } from "next-i18next";

export const FileNameInput = () => {
  const { t } = useTranslation(["form-builder"]);
  const { updateField, getName } = useTemplateStore((s) => ({
    getName: s.getName,
    updateField: s.updateField,
  }));

  const [content, setContent] = useState("");

  useEffect(() => {
    if (span?.current) {
      setWidth(span.current?.offsetWidth + 50);
    }
  }, [content]);

  const [width, setWidth] = useState(0);
  const span = useRef<HTMLElement>(null);

  const widthStyle = width ? { width: `${width}px` } : {};

  return (
    <div className="flex py-2">
      <span className={`px-2 invisible absolute`} ref={span}>
        {content}
      </span>
      <input
        style={widthStyle}
        className="px-2 min-w-[200px] max-w-[500px] border-2 border-white text-base font-bold placeholder-black hover:border-2 hover:border-gray-default"
        name="filename"
        placeholder={t("untitledForm", { ns: "form-builder" })}
        value={content ? content : getName()}
        onBlur={() => {
          updateField(`name`, content);
        }}
        onChange={(e) => {
          setContent(e.target.value);
        }}
      />
    </div>
  );
};
