import React, { useRef, useEffect, useState } from "react";
import { useMyPlateEditorRef } from "../plate-editor/types";
import { ElementType, Language, LocalizedElementProperties } from "../types";
import { serializeMd } from "../plate-editor/helpers/markdown";
import { deserializeMd, Value } from "@udecode/plate";
import { RichTextEditor } from "../plate-editor/RichTextEditor";
import useTemplateStore from "../store/useTemplateStore";

export const Editor = ({
  element,
  index,
  language,
}: {
  element: ElementType;
  index: number;
  language: Language;
}) => {
  const { localizeField, updateField } = useTemplateStore();

  const editorId = `${index}-editor-${language}`;
  const editor = useMyPlateEditorRef(editorId);

  const [value, setValue] = useState(
    element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, language)]
      ? deserializeMd(
          editor,
          element.properties[localizeField(LocalizedElementProperties.DESCRIPTION, language)]
        )
      : [{ children: [{ text: "" }] }]
  );

  const handleChange = (value: Value) => {
    let serialized = serializeMd(value);

    if (typeof serialized === "undefined") {
      serialized = "";
    }

    setValue(value);
    updateField(
      `form.elements[${index}].properties.${localizeField(
        LocalizedElementProperties.DESCRIPTION,
        language
      )}`,
      serialized
    );
  };

  return <RichTextEditor id={editorId} value={value} onChange={handleChange} />;
};
