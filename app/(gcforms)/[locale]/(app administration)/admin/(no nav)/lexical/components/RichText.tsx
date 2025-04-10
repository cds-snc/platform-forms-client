"use client";

import { Editor } from "@gcforms/editor";
import { useTranslation } from "@i18n/client";

export const RichText = () => {
  const { i18n } = useTranslation();
  return <Editor locale={i18n.language} contentLocale="en" />;
};
