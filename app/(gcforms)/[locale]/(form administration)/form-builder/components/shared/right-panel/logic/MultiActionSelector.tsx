"use client";
import React, { useMemo, useState } from "react";
import { useTranslation } from "@i18n/client";

import { FormElement } from "@lib/types";
import { GroupsType } from "@lib/formContext";

import { GroupSelect } from "./GroupSelect";
import { ChoiceSelect } from "./ChoiceSelect";
import { Button } from "@clientComponents/globals";

import { NextActionRule } from "@lib/formContext";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useFlowRef } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";

export const GroupAndChoiceSelect = ({
  selectedElement,
  groupId,
  choiceId,
  index,
  updateChoiceId,
  updateGroupId,
  removeSelector,
}: {
  selectedElement: FormElement | null;
  groupId: string | null;
  choiceId: string | null;
  index: number;
  updateChoiceId: (index: number, id: string) => void;
  updateGroupId: (index: number, id: string) => void;
  removeSelector: (index: number) => void;
}) => {
  const { t } = useTranslation("form-builder");

  const { translationLanguagePriority } = useTemplateStore((s) => ({
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const language = translationLanguagePriority;
  const id = useGroupStore((state) => state.id);
  const currentGroup = id;

  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};
  let groupItems = Object.keys(formGroups).map((key) => {
    const item = formGroups[key];
    return { label: item.name, value: key };
  });

  // Filter out the current group
  groupItems = groupItems.filter((item) => item.value !== currentGroup);

  const choices = useMemo(() => {
    return selectedElement?.properties.choices?.map((choice, index) => {
      const result = { label: choice[language], value: `${selectedElement.id}.${index}` };
      return result;
    });
  }, [selectedElement, language]);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateGroupId(index, value);
  };

  const handleChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateChoiceId(index, value);
  };

  const handleRemove = () => {
    removeSelector(index);
  };

  return (
    <>
      {choices && (
        <fieldset className="border-b border-dotted border-slate-500">
          <div className="mb-4">
            <ChoiceSelect selected={choiceId} choices={choices} onChange={handleChoiceChange} />
          </div>
          <div className="mb-4">
            <GroupSelect selected={groupId} groups={groupItems} onChange={handleGroupChange} />
          </div>
          <Button className="mb-8 inline-block" theme="link" onClick={handleRemove}>
            {t("addConditionalRules.removeRule")}
          </Button>
        </fieldset>
      )}
    </>
  );
};

export const MultiActionSelector = ({
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
  const { flow } = useFlowRef();

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
      id={formId}
      {...(descriptionId && { "aria-describedby": descriptionId })}
    >
      <div className="mb-6" aria-live="polite" aria-relevant="all">
        {nextActions.map((action, index) => {
          return (
            <GroupAndChoiceSelect
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
            flow.current?.updateEdges();
          }}
        >
          Save
        </Button>
      </div>
    </form>
  );
};
