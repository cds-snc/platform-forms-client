import { FormElement } from "@lib/types";
import { useTranslation } from "next-i18next";
import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language } from "../../types";
import { LanguageLabel } from "./LanguageLabel";

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
                {t(element.type)}: {t("optionText")}
              </legend>
              <div className="section-text">
                <label
                  className="sr-only"
                  htmlFor={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriority}`}
                >
                  {t(`${translationLanguagePriority}-text`)}
                </label>
                <div className="relative">
                  <LanguageLabel id={`element-${index}-choice-${choiceIndex}-en-language`}>
                    {t(translationLanguagePriority)}
                  </LanguageLabel>
                  <input
                    id={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriority}`}
                    aria-describedby={`element-${index}-choice-${choiceIndex}-en-language`}
                    type="text"
                    value={choice[translationLanguagePriority]}
                    onChange={(e) => {
                      updateField(
                        `form.elements[${index}].properties.choices[${choiceIndex}].${translationLanguagePriority}`,
                        e.target.value
                      );
                    }}
                  />
                </div>
                <label
                  className="sr-only"
                  htmlFor={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriorityAlt}`}
                >
                  {t(`${translationLanguagePriorityAlt}-text`)}
                </label>
                <div className="relative">
                  <LanguageLabel id={`element-${index}-choice-${choiceIndex}-fr-language`}>
                    {t(translationLanguagePriorityAlt)}
                  </LanguageLabel>
                  <input
                    id={`element-${element.id}-choice-${choiceIndex}-text-${translationLanguagePriorityAlt}`}
                    aria-describedby={`element-${index}-choice-${choiceIndex}-fr-language`}
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
            </fieldset>
          </div>
        ))}
      </div>
    </>
  );
};
