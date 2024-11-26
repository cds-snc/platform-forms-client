"use client";
import React, { useEffect, useState } from "react";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ChoiceRule, getElementsWithRuleForChoice } from "@lib/formContext";
import { ConditionalSelector } from "@formBuilder/components/shared/conditionals/ConditionalSelector";
import { sortByGroups, sortByLayout } from "@lib/utils/form-builder";
import { AddOther } from "@formBuilder/components/shared/conditionals/AddOther";

import Markdown from "markdown-to-jsx";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

export const RulesForm = ({
  item,
  descriptionId,
  tryLogicView,
  choiceRulesRef,
  mode,
  selectedOptionId,
}: {
  item: FormElementWithIndex;
  setItem: (item: FormElementWithIndex) => void;
  descriptionId?: string;
  tryLogicView: () => void;
  choiceRulesRef: React.MutableRefObject<ChoiceRule[]>;
  mode: "add" | "edit";
  selectedOptionId: string | null;
}) => {
  const { t } = useTranslation("form-builder");
  const formId = `form-${Date.now()}`;
  const [showLogicDetails, setShowLogicDetails] = useState(false);

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

  const learnMoreAboutLogicView = () => {
    setShowLogicDetails(showLogicDetails ? false : true);
  };

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      id={formId}
      {...(descriptionId && { "aria-describedby": descriptionId })}
    >
      <div className="mb-6" aria-live="polite" aria-relevant="all">
        {choiceRules.map((rule, index) => {
          return (
            <ConditionalSelector
              itemId={item.id}
              index={index}
              key={`${rule.choiceId}-${index}`}
              elements={sortedElements}
              elementId={rule.elementId}
              choiceId={rule.choiceId}
              updateElementId={updateElementId}
              updateChoiceId={updateChoiceId}
              removeSelector={removeSelector}
            />
          );
        })}
      </div>
      <div className="mb-6">
        <div className="mb-4">
          <Button
            className="mr-4"
            onClick={() => {
              setChoiceRules([...choiceRules, { elementId: "", choiceId: String(item.id) }]);
            }}
            theme={"secondary"}
            aria-controls={formId}
          >
            {t("addConditionalRules.addAnotherRule")}
          </Button>
          <AddOther item={item} onComplete={updateModalFromBase} />
        </div>
        <div>
          <Button theme={"link"} onClick={learnMoreAboutLogicView}>
            {t("logic.tryitout.button")}
          </Button>
          <div
            id="viewLogicDetails"
            className={`border-x-4 border-gray-800 px-5 ${showLogicDetails ? "" : "hidden"}`}
          >
            <div className="my-4">
              <Markdown options={{ forceBlock: true }}>{t("logic.tryitout.text")}</Markdown>
            </div>
            <Button theme={"primary"} onClick={tryLogicView}>
              {t("logic.tryitout.open")}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
