import { FormElement } from "@lib/types";
import { useTranslation } from "next-i18next";
import React from "react";
import { useTemplateStore } from "../store/useTemplateStore";
import { Language } from "../types";

export const Options = ({
  element,
  index,
  translationLanguagePriority,
}: {
  element: FormElement;
  index: number;
  translationLanguagePriority: Language;
}) => {
  const updateField = useTemplateStore((s) => s.updateField);
  const { t } = useTranslation("form-builder");
  const translationLanguagePriorityAlt = translationLanguagePriority === "en" ? "fr" : "en";

  return (
    <>
      <div>
        {element.properties.choices?.map((choice, choiceIndex) => (
          <div className="choice" key={`choice-${choiceIndex}`}>
            <fieldset className="text-entry">
              <legend className="section-heading">
                {t(element.type)}: {t("Option text")}
              </legend>
              <div className="section-text">
                <label
                  className="sr-only"
                  htmlFor={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriority}`}
                >
                  {t(`${translationLanguagePriority}-text`)}
                </label>
                <input
                  id={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriority}`}
                  type="text"
                  value={choice[translationLanguagePriority]}
                  onChange={(e) => {
                    updateField(
                      `form.elements[${index}].properties.choices[${choiceIndex}].${translationLanguagePriority}`,
                      e.target.value
                    );
                  }}
                />
                <label
                  className="sr-only"
                  htmlFor={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriorityAlt}`}
                >
                  {t(`${translationLanguagePriorityAlt}-text`)}
                </label>
                <input
                  id={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriorityAlt}`}
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
            </fieldset>
          </div>
        ))}
      </div>
    </>
  );
};
