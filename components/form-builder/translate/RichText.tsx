import { useTranslation } from "next-i18next";
import React from "react";
import { ElementType, Language } from "../types";
import { Editor } from "./Editor";

export const RichText = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: ElementType;
  index: number;
  translationLanguagePriority: Language;
}) => {
  const { t } = useTranslation("form-builder");
  const translationLanguagePriorityAlt = translationLanguagePriority === "en" ? "fr" : "en";

  return (
    <>
      <div className="text-entry">
        <div>
          <span className="section">{t(element.type)}</span>
          <span className="description">{t("Description")}</span>
          <Editor element={element} index={index} language={translationLanguagePriority} />
        </div>
        <div>
          <Editor element={element} index={index} language={translationLanguagePriorityAlt} />
        </div>
      </div>
    </>
  );
};
