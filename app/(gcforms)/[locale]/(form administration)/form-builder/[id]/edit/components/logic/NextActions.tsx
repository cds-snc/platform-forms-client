"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { FormElement } from "@lib/types";
import { NextActionRule } from "@lib/formContext";
import { NextActionSelector } from "./conditionals/NextActionSelector";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

export const NextActions = ({
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

  const getId = useGroupStore((state) => state.getId);
  const findParentGroup = useGroupStore((state) => state.findParentGroup);
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);
  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  // const autoSetNextActions = useGroupStore((state) => state.autoSetNextActions);

  if (initialNextActionRules.length == 0) {
    initialNextActionRules.push({ groupId: "start", choiceId: `${item.id}.0` });
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
      <div className="text-sm">
        <div className="mb-2 font-bold">Section:</div>
        <div className="mb-2">{getId()}</div>
      </div>
      <div className="text-sm">
        <div className="mb-2 font-bold">Selected Question: </div>
        <div className="mb-2">{item.properties.titleEn}</div>
      </div>
      <div className="max-w-['100px'] text-sm">
        <div className="mb-2 font-bold">Section next Action: </div>
        <pre className="overflow-scroll border-2 border-black/50 p-2">
          {JSON.stringify(getGroupNextAction(getId()))}
        </pre>
      </div>
      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
        id={formId}
        {...(descriptionId && { "aria-describedby": descriptionId })}
      >
        <div className="mb-6" aria-live="polite" aria-relevant="all">
          {nextActions.map((action, index) => {
            return (
              <NextActionSelector
                index={index}
                key={`${action.choiceId}-${index}`}
                selectedElement={item}
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
          <Button
            className="ml-4"
            onClick={() => {
              const group = findParentGroup(String(item.id));
              const parent = group?.index;
              // first auto set the next actions for all the groups
              // autoSetNextActions();
              parent && setGroupNextAction(parent as string, nextActions);
            }}
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
};

NextActions.propTypes = {
  item: PropTypes.object,
};
