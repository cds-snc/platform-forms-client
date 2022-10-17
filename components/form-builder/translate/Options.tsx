import { useTranslation } from "next-i18next";
import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType } from "../types";

export const Options = ({
  element,
  translationLanguagePriority,
}: {
  element: ElementType;
  index: number;
  translationLanguagePriority: string;
}) => {
  const { updateField } = useTemplateStore();
  const { t } = useTranslation("form-builder");
  const translationLanguagePriorityAlt = translationLanguagePriority === "en" ? "fr" : "en";

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
                  value={choice[translationLanguagePriority]}
                  onChange={(e) => {
                    updateField(
                      `element.properties.choices[${choiceIndex}].${translationLanguagePriority}`,
                      e.target.value
                    );
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={choice[translationLanguagePriorityAlt]}
                  onChange={(e) => {
                    updateField(
                      `element.properties.choices[${choiceIndex}].${translationLanguagePriorityAlt}`,
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
