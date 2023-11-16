import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "next-i18next";

import { FormElementWithIndex } from "../../types";
import { ConditionalSelector } from "../shared/conditionals/ConditionalSelector";
import { useTemplateStore } from "@formbuilder/store";
import { getElementsWithRuleForChoice } from "@lib/formContext";
import { Button } from "@components/globals";
import { ModalProperties } from "../../store/useModalRulesStore";

export const ModalFormRules = ({
  item,
  properties,
  updateModalProperties,
}: {
  item: FormElementWithIndex;
  properties: ModalProperties;
  updateModalProperties: (id: number, properties: ModalProperties) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  const initialChoiceRules = getElementsWithRuleForChoice({
    formElements: elements,
    itemId: item.id,
  });

  const [choiceRules, setChoiceRules] = useState(initialChoiceRules);

  const setConditional = (selectedChoice: string | null, selectedQuestion: string | null): void => {
    if (!selectedQuestion) {
      return;
    }

    if (!selectedChoice) {
      // @todo remove rule
      return;
    }

    const rule = { questionId: selectedQuestion, choiceId: selectedChoice };

    updateModalProperties(item.id, {
      initialChoiceRules,
      conditionalRules: [...properties.conditionalRules, rule],
    });
  };

  return (
    <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
      <div className="mb-6">
        {choiceRules.map((rule, index) => {
          return (
            <ConditionalSelector
              key={`${rule.choiceId}-${index}`}
              elements={elements}
              questionId={rule.questionId}
              choiceId={rule.choiceId}
              setConditional={setConditional}
            />
          );
        })}
      </div>
      <div className="mb-6">
        <Button
          onClick={() => {
            setChoiceRules([...choiceRules, { questionId: "", choiceId: String(item.id) }]);
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
