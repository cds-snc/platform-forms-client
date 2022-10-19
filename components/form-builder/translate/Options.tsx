import { useTranslation } from "next-i18next";
import React from "react";
import useTemplateStore from "../store/useTemplateStore";
import { ElementType, Language } from "../types";

export const Options = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: ElementType;
  index: number;
  translationLanguagePriority: Language;
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
              <div className="section-heading">
                {t(element.type)}: {t("Option text")}
              </div>
              <div className="section-text">
                <input
                  type="text"
                  value={choice[translationLanguagePriority]}
                  onChange={(e) => {
                    updateField(
                      `form.elements[${index}].properties.choices[${choiceIndex}].${translationLanguagePriority}`,
                      e.target.value
                    );
                  }}
                />
                <input
                  type="text"
                  value={choice[translationLanguagePriorityAlt]}
                  onChange={(e) => {
                    updateField(
                      `form.elements[${index}].properties.choices[${choiceIndex}].${translationLanguagePriorityAlt}`,
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
