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
import { useCustomEvent, EventKeys } from "@lib/hooks/useCustomEvent";

export const ConditionalIndicatorOption = ({
  itemId,
  id,
  elements,
  isFocused,
}: {
  itemId: number;
  id: string;
  elements: FormElement[];
  isFocused: boolean;
}) => {
  const { t } = useTranslation("form-builder");
  const { Event } = useCustomEvent();
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
    return (
      <div className="ml-2 mt-2">
        {isFocused && (
          <div>
            <ConditionalIcon className="mr-2  inline-block" />
            <Button
              theme="link"
              className="cursor-pointer underline"
              id={rulesTitleId}
              onClick={() => {
                Event.fire(EventKeys.openRulesDialog, {
                  mode: "add",
                  itemId: itemId,
                  optionId: id,
                });
              }}
            >
              {t("addConditionalRules.addCustomRules")}
            </Button>
          </div>
        )}
      </div>
    );
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
              {" • "}
              <Button
                theme="link"
                onClick={() => {
                  Event.fire(EventKeys.openRulesDialog, {
                    mode: "edit",
                    itemId: itemId,
                    optionId: id,
                  });
                }}
              >
                {t("addConditionalRules.editCustomRules")}
              </Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
