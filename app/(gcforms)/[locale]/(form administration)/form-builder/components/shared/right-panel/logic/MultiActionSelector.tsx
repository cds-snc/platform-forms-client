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
import { ensureChoiceId } from "@lib/formContext";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";

export const GroupAndChoiceSelect = ({
  groupId,
  item,
  choiceId,
  index,
  updateChoiceId,
  updateGroupId,
  removeSelector,
}: {
  groupId: string | null;
  item: FormElement;
  choiceId: string | null;
  index: number;
  updateChoiceId: (index: number, id: string) => void;
  updateGroupId: (index: number, id: string) => void;
  removeSelector: (index: number) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const { language } = useTemplateStore((s) => ({
    language: s.translationLanguagePriority,
  }));
  const getElement = useGroupStore((state) => state.getElement);
  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};

  // Get the current group
  const currentGroup = useGroupStore((state) => state.id);

  // Get the parent question of the next action choice
  const choiceParentQuestion = choiceId?.split(".")[0] || null;

  // Get the element associated with the parent question
  const choiceElement = getElement(Number(choiceParentQuestion));

  let groupItems = Object.keys(formGroups).map((key) => {
    const item = formGroups[key];
    return { label: item.name, value: key };
  });

  // Filter out the current group
  groupItems = groupItems.filter((item) => item.value !== currentGroup);

  const choices = useMemo(() => {
    return choiceElement?.properties.choices?.map((choice, index) => {
      const result = { label: choice[language], value: `${choiceElement.id}.${index}` };
      return result;
    });
  }, [choiceElement, language]);

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

  // If the parent question of the choice is not the current question, return null
  if (String(item.id) !== choiceParentQuestion) {
    return null;
  }

  return (
    <>
      {choices && (
        <fieldset className="mb-4 border-b border-dotted border-slate-500">
          <div className="mb-4">
            <ChoiceSelect
              selected={choiceId}
              choices={choices}
              onChange={handleChoiceChange}
              addCatchAll={true}
            />
          </div>
          <div className="mb-4">
            <GroupSelect selected={groupId} groups={groupItems} onChange={handleGroupChange} />
          </div>
          <Button className="mb-8 inline-block text-sm" theme="link" onClick={handleRemove}>
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

  const { localizeField, language } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    language: s.translationLanguagePriority,
  }));

  const updateGroupId = (index: number, id: string) => {
    const rules = [...nextActions];
    const choiceId = ensureChoiceId(rules[index]["choiceId"]);
    rules[index] = { groupId: id, choiceId };
    setNextActions(rules);
  };

  const updateChoiceId = (index: number, id: string) => {
    const rules = [...nextActions];
    rules[index] = { groupId: rules[index]["groupId"], choiceId: ensureChoiceId(id) };
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

  const title = item
    ? item.properties[localizeField(LocalizedElementProperties.TITLE, language)]
    : "";

  return (
    <>
      <h3 className="block text-sm font-normal">
        <strong>{t("logic.questionTitle")}</strong> {title}
      </h3>
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
                item={item}
                key={`${action.choiceId}-${index}`}
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
            className="px-4 py-1"
            aria-controls={formId}
          >
            {t("addConditionalRules.addAnotherRule")}
          </Button>
          <Button
            className="ml-4 px-4 py-1"
            onClick={() => {
              const group = findParentGroup(String(item.id));
              const parent = group?.index;
              parent && setGroupNextAction(parent as string, nextActions);
              flow.current?.updateEdges();
            }}
          >
            {t("logic.saveRule")}
          </Button>
        </div>
      </form>
    </>
  );
};
