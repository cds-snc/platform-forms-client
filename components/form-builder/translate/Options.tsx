import { useTranslation } from "next-i18next";
import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType } from "../types";

export const Options = ({ element, index }: { element: ElementType; index: number }) => {
  const { updateField } = useTemplateStore();
  const { t } = useTranslation("form-builder");

  return (
    <>
      <div>
        {element.properties.choices.map((choice, choiceIndex) => (
          <div className="choice" key={`choice-${choiceIndex}`} id={`choice-${choiceIndex}`}>
            <div className="text-entry">
              <div>
                <span>{t(element.type)}</span>
                <span>Option text</span>
                <input
                  type="text"
                  value={choice.en}
                  onChange={(e) => {
                    updateField(
                      `form.elements[${index}].properties.choices[${choiceIndex}].en`,
                      e.target.value
                    );
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={choice.fr}
                  onChange={(e) => {
                    updateField(
                      `form.elements[${index}].properties.choices[${choiceIndex}].fr`,
                      e.target.value
                    );
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
