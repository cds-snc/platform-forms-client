"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store";
import { ModalProperties } from "@lib/store/useModalRulesStore";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { ChoiceRule } from "@lib/formContext";
import { ConditionalSelector } from "@formBuilder/components/shared/conditionals/ConditionalSelector";

export const ModalFormRules = ({
  item,
  properties,
  initialChoiceRules,
  updateModalProperties,
  descriptionId,
}: {
  item: FormElementWithIndex;
  properties: ModalProperties;
  initialChoiceRules: ChoiceRule[];
  updateModalProperties: (id: number, properties: ModalProperties) => void;
  descriptionId?: string;
}) => {
  const { t } = useTranslation("form-builder");
  const formId = `form-${Date.now()}`;

  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

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
              elements={elements}
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
        <Button
          onClick={() => {
            setChoiceRules([...choiceRules, { elementId: "", choiceId: String(item.id) }]);
          }}
          theme={"secondary"}
          aria-controls={formId}
        >
          {t("addConditionalRules.addAnotherRule")}
        </Button>
      </div>
    </form>
  );
};

ModalFormRules.propTypes = {
  item: PropTypes.object,
};
