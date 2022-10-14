import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType } from "../types";
import { useTranslation } from "next-i18next";

export const Description = ({ element, index }: { element: ElementType; index: number }) => {
  const { updateField, form } = useTemplateStore();
  const { t } = useTranslation("form-builder");
  return (
    <>
      <div className="text-entry">
        <div>
          <span>{t(element.type)}</span>
          <span>Description</span>
          <textarea
            value={form.elements[index].properties.descriptionEn}
            onChange={(e) => {
              updateField(`form.elements[${index}].properties.descriptionEn`, e.target.value);
            }}
          ></textarea>
        </div>
        <div>
          <textarea
            value={form.elements[index].properties.descriptionFr}
            onChange={(e) => {
              updateField(`form.elements[${index}].properties.descriptionFr`, e.target.value);
            }}
          ></textarea>
        </div>
      </div>
    </>
  );
};
