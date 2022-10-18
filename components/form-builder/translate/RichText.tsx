import { useTranslation } from "next-i18next";
import React from "react";
import styled from "styled-components";
import { ElementType, Language } from "../types";
import { Editor } from "./Editor";

const EditorWrapper = styled.div`
  display: flex;
  .slate-HeadingToolbar {
    margin: 0;
  }
`;

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
          <EditorWrapper>
            <Editor element={element} index={index} language={translationLanguagePriority} />
          </EditorWrapper>
        </div>
        <div>
          <EditorWrapper>
            <Editor element={element} index={index} language={translationLanguagePriorityAlt} />
          </EditorWrapper>
        </div>
      </div>
    </>
  );
};
