"use client";
import React from "react";
import { useTranslation } from "@i18n/client";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ConditionalIcon } from "@serverComponents/icons/ConditionalIcon";
import { getQuestionNumber, sortByLayout } from "@lib/utils/form-builder";
import { getElementIndexes } from "@lib/utils/form-builder/getPath";

const RuleIndicator = ({ choiceId }: { choiceId: string }) => {
  const { t } = useTranslation("form-builder");
  const getChoice = useTemplateStore((state) => state.getChoice);
  const layout = useTemplateStore((state) => state.form.layout);

  const translationLanguagePriority = useTemplateStore(
    (state) => state.translationLanguagePriority
  );

  const elements = useTemplateStore((state) => state.form.elements);
  // Ensure elements are sorted by layout
  const sortedElements = sortByLayout({ layout, elements: [...elements] });
  const parentId = Number(choiceId.split(".")[0]);
  const childId = Number(choiceId.split(".")[1]);
  const choice = getChoice(parentId, childId);
  if (!choice) return null;
  const choiceValue = choice[translationLanguagePriority];
  const indexes = getElementIndexes(parentId, elements);
  if (!indexes || !indexes[0]) return null;
  const itemId = indexes[0];
  const questionNumber = getQuestionNumber(elements[itemId], sortedElements);
  // For debugging
  const elementId = elements[itemId]?.id;
  return (
    <div data-element-id={elementId}>
      <ConditionalIcon className="mr-2 mt-[-5px] inline-block" />
      <div className="inline-block p-2">
        {t("question")} {questionNumber}
      </div>
      <span className="hidden">{`${choiceValue}`}</span>
    </div>
  );
};

export const ConditionalIndicator = ({ item }: { item: FormElementWithIndex }) => {
  const hasConditionalRules = item.properties.conditionalRules;

  if (!hasConditionalRules || !item.properties.conditionalRules) return null;

  const rules = item.properties.conditionalRules?.map((rule) => {
    const choiceId = rule?.choiceId as string;
    return (
      <div className="mt-2" key={choiceId}>
        <RuleIndicator choiceId={choiceId} />
      </div>
    );
  });

  return <>{rules}</>;
};
