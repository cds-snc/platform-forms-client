import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType } from "../types";
import { useTranslation } from "next-i18next";

export const Title = ({ element, index }: { element: ElementType; index: number }) => {
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
            value={element.properties.titleEn}
            onChange={(e) => {
              updateField(`form.elements[${index}].properties.titleEn`, e.target.value);
            }}
          />
        </div>
        <div>
          <input
            type="text"
            value={element.properties.titleFr}
            onChange={(e) => {
              updateField(`form.elements[${index}].properties.titleFr`, e.target.value);
            }}
          />
        </div>
      </div>
    </>
  );
};
