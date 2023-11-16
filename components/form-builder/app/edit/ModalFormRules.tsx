import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import { Button } from "@components/globals";
import { useTemplateStore } from "@formbuilder/store";
import { ModalProperties } from "../../store/useModalRulesStore";
import { FormElementWithIndex } from "../../types";
import { ChoiceRule } from "@lib/formContext";
import { ConditionalSelector } from "../shared/conditionals/ConditionalSelector";

export const ModalFormRules = ({
  item,
  properties,
  initialChoiceRules,
  updateModalProperties,
}: {
  item: FormElementWithIndex;
  properties: ModalProperties;
  initialChoiceRules: ChoiceRule[];
  updateModalProperties: (id: number, properties: ModalProperties) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

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
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
      <div className="mb-6">
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
