"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";
import { ChoiceRule } from "@lib/formContext";
import { ConditionalSelector } from "./conditionals/ConditionalSelector";

export const NextActionSelector = ({
  item,
  initialChoiceRules,
  descriptionId,
}: {
  item: FormElement;
  initialChoiceRules: ChoiceRule[];
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

NextActionSelector.propTypes = {
  item: PropTypes.object,
};
