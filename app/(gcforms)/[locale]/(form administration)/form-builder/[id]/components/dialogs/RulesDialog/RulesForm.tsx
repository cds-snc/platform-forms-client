"use client";
import React, { useEffect, useState, useId } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { type ChoiceRule } from "@gcforms/types";
import { ensureChoiceId, getElementsWithRuleForChoice } from "@gcforms/core";
import { ConditionalElementRuleSelector } from "@root/app/(gcforms)/[locale]/(form administration)/form-builder/components/shared/conditionals/ConditionalElementRuleSelector";
import { sortByGroups, sortByLayout } from "@gcforms/core";
import { AddOther } from "@formBuilder/components/shared/conditionals/AddOther";

import { FormElementWithIndex } from "@lib/types/form-builder-types";

export const RulesForm = ({
  item,
  descriptionId,
  choiceRulesRef,
  mode,
  selectedOptionId,
  targetElementId,
}: {
  item: FormElementWithIndex;
  setItem: (item: FormElementWithIndex) => void;
  descriptionId?: string;
  choiceRulesRef: React.MutableRefObject<ChoiceRule[]>;
  mode: "add" | "edit";
  selectedOptionId: string | null;
  targetElementId: string | null;
}) => {
  const { t } = useTranslation("form-builder");
  const formId = `form-${useId()}`;

  const { elements, form } = useTemplateStore((s) => ({
    elements: s.form.elements,
    form: s.form,
  }));

  const initialChoiceRules = getElementsWithRuleForChoice({
    formElements: elements,
    itemId: item.id,
  });

  if (mode === "add" && selectedOptionId) {
    initialChoiceRules.push({ elementId: String(item.id), choiceId: selectedOptionId });
  }

  if (initialChoiceRules.length == 0) {
    initialChoiceRules.push({ elementId: String(item.id), choiceId: `${item.id}.0` });
  }

  const [choiceRules, setChoiceRules] = useState<ChoiceRule[]>(initialChoiceRules);
  const [highlightedRuleIndex, setHighlightedRuleIndex] = useState<number | null>(null);
  const highlightedChoiceId = selectedOptionId ? ensureChoiceId(selectedOptionId) : null;

  useEffect(() => {
    choiceRulesRef.current = choiceRules;
  }, [choiceRules, choiceRulesRef]);

  let sortedElements = sortByLayout({ layout: form.layout, elements: elements });

  sortedElements = sortByGroups({ form: form, elements: elements });

  const updateElementId = (index: number, id: string) => {
    const rules = [...choiceRules];
    rules[index] = { elementId: id, choiceId: rules[index]["choiceId"] };
    setChoiceRules(rules);
  };

  const updateChoiceId = (index: number, id: string) => {
    const rules = [...choiceRules];
    rules[index] = { elementId: rules[index]["elementId"], choiceId: id };
    setChoiceRules(rules);
  };

  const removeSelector = (index: number) => {
    const rules = [...choiceRules];
    rules.splice(index, 1);
    setChoiceRules(rules);
  };

  const updateModalFromBase = (newRule: ChoiceRule) => {
    const rules = [...choiceRules];
    rules.push(newRule);
    setChoiceRules(rules);
  };

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      id={formId}
      {...(descriptionId && { "aria-describedby": descriptionId })}
    >
      <div className="mb-0" aria-live="polite" aria-relevant="all">
        {choiceRules.map((rule, index) => {
          return (
            <ConditionalElementRuleSelector
              itemId={item.id}
              index={index}
              key={`${rule.choiceId}-${index}`}
              elements={sortedElements}
              elementId={rule.elementId}
              choiceId={rule.choiceId}
              updateElementId={updateElementId}
              updateChoiceId={updateChoiceId}
              removeSelector={removeSelector}
              isHighlighted={
                highlightedRuleIndex === index ||
                (highlightedRuleIndex === null &&
                  mode === "edit" &&
                  rule.choiceId === highlightedChoiceId &&
                  rule.elementId === targetElementId)
              }
            />
          );
        })}
      </div>
      <div className="sticky bottom-[85px] z-10 -mx-5 mb-0 border-t border-slate-500 bg-white px-5 py-2">
        <div className="m-0">
          <Button
            className="mr-4 mb-2"
            onClick={() => {
              setChoiceRules([...choiceRules, { elementId: "", choiceId: String(item.id) }]);
              setHighlightedRuleIndex(choiceRules.length);
            }}
            theme={"secondary"}
            aria-controls={formId}
          >
            {t("addConditionalRules.addAnotherRule")}
          </Button>
          <AddOther item={item} onComplete={updateModalFromBase} />
        </div>
      </div>
    </form>
  );
};
