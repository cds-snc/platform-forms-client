import { FormElement } from "@lib/types";
import { useTranslation } from "next-i18next";
import React from "react";
import { useTemplateStore } from "../../store/useTemplateStore";
import { Language } from "../../types";
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
              <div className="flex gap-px border-b border-r border-t border-gray-300 mb-10 divide-x-2">
                <label
                  className="sr-only"
                  htmlFor={`element-${element.id}-choice-${choiceIndex}-text-${primaryLanguage}`}
                >
                  {t(`${primaryLanguage}-text`)}
                </label>
                <div className="w-1/2 flex-1 relative">
                  <LanguageLabel
                    id={`element-${index}-choice-${choiceIndex}-en-language`}
                    lang={primaryLanguage}
                  >
                    <>{t(primaryLanguage)}</>
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
                  {t(`${secondaryLanguage}-text`)}
                </label>
                <div className="w-1/2 flex-1 relative">
                  <LanguageLabel
                    id={`element-${index}-choice-${choiceIndex}-fr-language`}
                    lang={secondaryLanguage}
                  >
                    <>{t(secondaryLanguage)}</>
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
