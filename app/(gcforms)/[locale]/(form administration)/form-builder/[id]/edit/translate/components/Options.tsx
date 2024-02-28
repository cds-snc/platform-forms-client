"use client";
import { FormElement } from "@lib/types";
import { useTranslation } from "@i18n/client";
import React from "react";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Language } from "@lib/types/form-builder-types";
import { FieldsetLegend } from "./FieldsetLegend";
import { LanguageLabel } from "./LanguageLabel";

export const Options = ({
  element,
  index,
  primaryLanguage,
}: {
  element: FormElement;
  index: number;
  primaryLanguage: Language;
}) => {
  const { updateField, propertyPath } = useTemplateStore((s) => ({
    updateField: s.updateField,
    propertyPath: s.propertyPath,
  }));
  const { t } = useTranslation("form-builder");
  const secondaryLanguage = primaryLanguage === "en" ? "fr" : "en";

  const path = propertyPath(element.id, "choices");

  return (
    <>
      <div>
        {element.properties.choices?.map((choice, choiceIndex) => (
          <div className="choice" key={`choice-${choiceIndex}`}>
            <fieldset>
              <FieldsetLegend>
                {t(`addElementDialog.${element.type}.title`)}: {t("optionText")}
              </FieldsetLegend>
              <div className="mb-10 flex gap-px divide-x-2 border-y border-r border-gray-300">
                <label
                  className="sr-only"
                  htmlFor={`element-${element.id}-choice-${choiceIndex}-text-${primaryLanguage}`}
                >
                  {primaryLanguage}
                </label>
                <div className="relative w-1/2 flex-1">
                  <LanguageLabel
                    id={`element-${index}-choice-${choiceIndex}-en-language`}
                    lang={primaryLanguage}
                  >
                    <>{primaryLanguage}</>
                  </LanguageLabel>
                  <input
                    className="w-full p-4"
                    id={`element-${element.id}-choice-${choiceIndex}-text-${primaryLanguage}`}
                    aria-describedby={`element-${index}-choice-${choiceIndex}-en-language`}
                    type="text"
                    value={choice[primaryLanguage]}
                    onChange={(e) => {
                      updateField(`${path}[${choiceIndex}].${primaryLanguage}`, e.target.value);
                    }}
                  />
                </div>
                <label
                  className="sr-only"
                  htmlFor={`element-${element.id}-choice-${choiceIndex}-text-${secondaryLanguage}`}
                >
                  {secondaryLanguage}
                </label>
                <div className="relative w-1/2 flex-1">
                  <LanguageLabel
                    id={`element-${index}-choice-${choiceIndex}-fr-language`}
                    lang={secondaryLanguage}
                  >
                    <>{secondaryLanguage}</>
                  </LanguageLabel>
                  <input
                    className="w-full p-4"
                    id={`element-${element.id}-choice-${choiceIndex}-text-${secondaryLanguage}`}
                    aria-describedby={`element-${index}-choice-${choiceIndex}-fr-language`}
                    type="text"
                    value={choice[secondaryLanguage]}
                    onChange={(e) => {
                      updateField(`${path}[${choiceIndex}].${secondaryLanguage}`, e.target.value);
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
