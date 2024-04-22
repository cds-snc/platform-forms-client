"use client";
import React, { useState } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";

import { Button } from "@clientComponents/globals";
import { FormElement } from "@lib/types";
import { NextActionRule } from "@lib/formContext";
import { NextActionSelector } from "./conditionals/NextActionSelector";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { GroupsType } from "@lib/formContext";
import { GroupSelect } from "./conditionals/NextActionSelector";

const SingleNextAction = ({
  item,
  nextAction = "end",
}: {
  item: FormElement;
  nextAction: string | undefined;
}) => {
  const getId = useGroupStore((state) => state.getId);
  const findParentGroup = useGroupStore((state) => state.findParentGroup);
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);

  const currentGroup = getId();
  const [nextActionId, setNextActionId] = useState(nextAction);

  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};
  let groupItems = Object.keys(formGroups).map((key) => {
    const item = formGroups[key];
    return { label: item.name, value: key };
  });

  groupItems.push({ label: "End", value: "end" });

  groupItems = groupItems.filter((group) => group.value !== currentGroup);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setNextActionId(value);
  };

  return (
    <div>
      <div>
        <div>
          <div className="mb-4">
            <GroupSelect
              selected={nextAction ? nextAction : null}
              groups={groupItems}
              onChange={handleGroupChange}
            />
          </div>
          <div>
            <Button
              className="ml-4"
              onClick={() => {
                const group = findParentGroup(String(item.id));
                const parent = group?.index;
                parent && setGroupNextAction(parent as string, nextActionId);
              }}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const MultiNextActions = ({
  item,
  descriptionId,
  initialNextActionRules,
}: {
  item: FormElement;
  descriptionId?: string;
  initialNextActionRules: NextActionRule[];
}) => {
  const [nextActions, setNextActions] = useState(initialNextActionRules);

  const findParentGroup = useGroupStore((state) => state.findParentGroup);
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);

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

  const { t } = useTranslation("form-builder");
  const formId = `form-${Date.now()}`;

  return (
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
            parent && setGroupNextAction(parent as string, nextActions);
          }}
        >
          Save
        </Button>
      </div>
    </form>
  );
};

export const NextActions = ({ item }: { item: FormElement }) => {
  const getId = useGroupStore((state) => state.getId);
  const getGroupNextAction = useGroupStore((state) => state.getGroupNextAction);
  const typesWithOptions = ["radio", "checkbox", "select"];
  const currentNextActions = getGroupNextAction(getId());

  return (
    <div>
      {typesWithOptions.includes(item.type) ? (
        <MultiNextActions
          item={item}
          initialNextActionRules={
            Array.isArray(currentNextActions)
              ? currentNextActions
              : [{ groupId: "end", choiceId: `${item.id}.0` }]
          }
        />
      ) : (
        <div>
          {!Array.isArray(currentNextActions) && (
            <SingleNextAction item={item} nextAction={currentNextActions} />
          )}
        </div>
      )}
    </div>
  );
};

NextActions.propTypes = {
  item: PropTypes.object,
};
