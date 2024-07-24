"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { ModalProperties } from "@lib/store/useModalRulesStore";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { ChoiceRule } from "@lib/formContext";
import { ConditionalSelector } from "@formBuilder/components/shared/conditionals/ConditionalSelector";
import { sortByGroups, sortByLayout } from "@lib/utils/form-builder";
import { AddOther } from "@formBuilder/components/shared/conditionals/AddOther";

import Markdown from "markdown-to-jsx";

export const ModalFormRules = ({
  item,
  properties,
  initialChoiceRules,
  updateModalProperties,
  descriptionId,
  tryLogicView,
}: {
  item: FormElementWithIndex;
  properties: ModalProperties;
  initialChoiceRules: ChoiceRule[];
  updateModalProperties: (id: number, properties: ModalProperties) => void;
  descriptionId?: string;
  tryLogicView: () => void;
}) => {
  const { t } = useTranslation("form-builder");
  const formId = `form-${Date.now()}`;
  const [showLogicDetails, setShowLogicDetails] = useState(false);

  const { elements, form, groupsEnabled } = useTemplateStore((s) => ({
    elements: s.form.elements,
    form: s.form,
    groupsEnabled: s.getGroupsEnabled(),
  }));

  let sortedElements = sortByLayout({ layout: form.layout, elements: elements });

  if (groupsEnabled) {
    sortedElements = sortByGroups({ form: form, elements: elements });
  }

  if (initialChoiceRules.length == 0) {
    initialChoiceRules.push({ elementId: "", choiceId: `${item.id}.0` });
  }

  const [choiceRules, setChoiceRules] = useState(initialChoiceRules);

  const updateElementId = (index: number, id: string) => {
    const rules = [...choiceRules];
    rules[index] = { elementId: id, choiceId: rules[index]["choiceId"] };
    setChoiceRules(rules);
    updateModalProperties(item.id, { ...properties, conditionalRules: rules });
  };

  const updateChoiceId = (index: number, id: string) => {
    const rules = [...choiceRules];
    rules[index] = { elementId: rules[index]["elementId"], choiceId: id };
    setChoiceRules(rules);
    updateModalProperties(item.id, { ...properties, conditionalRules: rules });
  };

  const removeSelector = (index: number) => {
    const rules = [...choiceRules];
    rules.splice(index, 1);
    setChoiceRules(rules);
    updateModalProperties(item.id, { ...properties, conditionalRules: rules });
  };

  const updateModalFromBase = (newRule: ChoiceRule) => {
    const rules = [...choiceRules];
    rules.push(newRule);
    setChoiceRules(rules);
    updateModalProperties(item.id, { ...properties, conditionalRules: rules });
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
            className={`border-x-4 border-dark-gray px-5 ${showLogicDetails ? "" : "hidden"}`}
          >
            <div className="mb-4 mt-4">
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

ModalFormRules.propTypes = {
  item: PropTypes.object,
};
