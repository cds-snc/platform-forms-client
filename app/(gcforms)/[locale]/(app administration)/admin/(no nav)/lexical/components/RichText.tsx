"use client";

import { Editor } from "@gcforms/editor";
import { useTranslation } from "@i18n/client";
import { useCallback, useState } from "react";

export const RichText = () => {
  const { i18n } = useTranslation();
  const [value, setValue] = useState("");

  const updateValue = useCallback(
    (value: string) => {
      setValue(value);
    },
    [setValue]
  );

  return (
    <Editor
      locale={i18n.language}
      content={value}
      contentLocale="en"
      className="gc-formview gc-richText"
      onChange={updateValue}
      maxLength={100}
    />
  );
};
