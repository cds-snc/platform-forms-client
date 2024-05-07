"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ConditionalIcon } from "@serverComponents/icons/ConditionalIcon";
import { getElementsUsingChoiceId } from "@lib/formContext";
import { FormElement } from "@lib/types";
import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";
import { Button } from "@clientComponents/globals";
import { LocalizedFormProperties } from "@lib/types/form-builder-types";

export const ConditionalIndicatorOption = ({
  id,
  elements,
}: {
  id: string;
  elements: FormElement[];
}) => {
  const { t } = useTranslation("form-builder");
  const questions = getElementsUsingChoiceId({
    formElements: elements,
    choiceId: id,
  });
  const rulesTitleId = `rules-title-${Date.now()}`;

  const { refs } = useRefsContext();

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const language = translationLanguagePriority;

  const titleKey = localizeField(LocalizedFormProperties.TITLE, language);

  if (!questions.length) {
    return null;
  }

  return (
    <div className="ml-2 mt-2">
      <div className="flex">
        <ConditionalIcon className="mr-2  inline-block" />
        <span id={rulesTitleId}>{t("addConditionalRules.show")}</span>
      </div>
      <ul className="list-none pl-4" aria-labelledby={rulesTitleId}>
        {questions.map(({ elementId }, index) => {
          const element = elements.find((element) => element.id === Number(elementId));
          let text = element?.properties?.[titleKey] || "";
          if (element?.type === "richText") {
            text = t("pageText", { ns: "form-builder" });
          }
          return (
            <li key={`${elementId}-${index}`} className="py-1 pl-4">
              <Button
                theme="link"
                onClick={() => {
                  const id = Number(elementId);
                  if (!refs || !refs.current) {
                    return;
                  }
                  refs.current[id].focus();
                }}
              >
                {text}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
