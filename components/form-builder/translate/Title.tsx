import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType } from "../types";
import { useTranslation } from "next-i18next";

export const Title = ({
  element,
  index,
  languagePriority,
}: {
  element: ElementType;
  index: number;
  languagePriority: string;
}) => {
  const { updateField } = useTemplateStore();
  const { t } = useTranslation("form-builder");
  return (
    <>
      <div className="text-entry">
        <div>
          <span>{t(element.type)}</span>
          <span>Question title</span>
          <input
            type="text"
            value={
              languagePriority === "en" ? element.properties.titleEn : element.properties.titleFr
            }
            onChange={(e) => {
              updateField(
                languagePriority === "en"
                  ? `form.elements[${index}].properties.titleEn`
                  : `form.elements[${index}].properties.titleFr`,
                e.target.value
              );
            }}
          />
        </div>
        <div>
          <input
            type="text"
            value={
              languagePriority === "en" ? element.properties.titleFr : element.properties.titleEn
            }
            onChange={(e) => {
              updateField(
                languagePriority === "en"
                  ? `form.elements[${index}].properties.titleFr`
                  : `form.elements[${index}].properties.titleEn`,
                e.target.value
              );
            }}
          />
        </div>
      </div>
    </>
  );
};
