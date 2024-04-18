"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement } from "@lib/types";
import { NextActionRule } from "@lib/formContext";
import { ConditionalSelector } from "./conditionals/ConditionalSelector";

export const NextActionSelector = ({
  item,
  initialNextActionRules,
  descriptionId,
}: {
  item: FormElement;
  initialNextActionRules: NextActionRule[];
  descriptionId?: string;
}) => {
  const { t } = useTranslation("form-builder");
  const formId = `form-${Date.now()}`;

  const { elements } = useTemplateStore((s) => ({
    elements: s.form.elements,
  }));

  if (initialNextActionRules.length == 0) {
    initialNextActionRules.push({ groupId: "", choiceId: `${item.id}.0` });
  }

  const [nextActions, setNextActions] = useState(initialNextActionRules);

  const updateGroupId = (index: number, id: string) => {
    const rules = [...nextActions];
    rules[index] = { groupId: id, choiceId: rules[index]["choiceId"] };
    setNextActions(rules);
  };

  const updateChoiceId = (index: number, id: string) => {
    const rules = [...nextActions];
    rules[index] = { groupId: rules[index]["groupId"], choiceId: id };
    setNextActions(rules);
  };

  const removeSelector = (index: number) => {
    const rules = [...nextActions];
    rules.splice(index, 1);
    setNextActions(rules);
  };

  return (
    <div>
      <pre>{JSON.stringify(nextActions)}</pre>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
        id={formId}
        {...(descriptionId && { "aria-describedby": descriptionId })}
      >
        <div className="mb-6" aria-live="polite" aria-relevant="all">
          {nextActions.map((action, index) => {
            return (
              <ConditionalSelector
                index={index}
                key={`${action.choiceId}-${index}`}
                elements={elements}
                groupId={action.groupId}
                choiceId={action.choiceId}
                updateGroupId={updateGroupId}
                updateChoiceId={updateChoiceId}
                removeSelector={removeSelector}
              />
            );
          })}
        </div>
        <div className="mb-6">
          <Button
            onClick={() => {
              setNextActions([...nextActions, { groupId: "", choiceId: String(item.id) }]);
            }}
            theme={"secondary"}
            aria-controls={formId}
          >
            {t("addConditionalRules.addAnotherRule")}
          </Button>
        </div>
      </form>
    </div>
  );
};

NextActionSelector.propTypes = {
  item: PropTypes.object,
};
