"use client";
import React, { useMemo, useState, useId } from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";

import { FormElement } from "@lib/types";
import { type GroupsType } from "@gcforms/types";

import { GroupSelect } from "./GroupSelect";
import { ChoiceSelect } from "./ChoiceSelect";
import { Button } from "@clientComponents/globals";
import { AddIcon } from "@serverComponents/icons";

import { type NextActionRule } from "@gcforms/types";
import { useGroupStore } from "@lib/groups/useGroupStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { useFlowRef } from "@formBuilder/[id]/edit/logic/components/flow/provider/FlowRefProvider";
import { ensureChoiceId } from "@gcforms/core";
import { LocalizedElementProperties } from "@lib/types/form-builder-types";
import { SaveNote } from "./SaveNote";
import { toast } from "@formBuilder/components/shared/Toast";
import { SectionName } from "./SectionName";
import { Language } from "@lib/types/form-builder-types";
import { lockedGroups } from "@formBuilder/components/shared/right-panel/headless-treeview/constants";
import { useTemplateContext } from "@lib/hooks/form-builder/useTemplateContext";
import { filterNextActionRulesForItem } from "./filterNextActionRulesForItem";
import { createsNextActionCycle } from "@lib/groups/utils/validateGroups";
import { InvalidNextActionDialog } from "./InvalidNextActionDialog";

const GroupAndChoiceSelect = ({
  groupId,
  item,
  choiceId,
  index,
  updateChoiceId,
  updateGroupId,
  removeSelector,
  nextActions,
}: {
  groupId: string | null;
  item: FormElement;
  choiceId: string | null;
  index: number;
  updateChoiceId: (index: number, id: string) => void;
  updateGroupId: (index: number, id: string) => void;
  removeSelector: (index: number) => void;
  nextActions: NextActionRule[];
}) => {
  const { t } = useTranslation(["form-builder", "common"]);
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
    if (lockedGroups.includes(key)) {
      return {
        label: t(`logic.${key}`),
        value: key,
      };
    }
    return { label: item.name, value: key };
  });

  // Filter out the current group
  groupItems = groupItems.filter((item) => item.value !== currentGroup && item.value !== "end");

  const choices = useMemo(() => {
    return choiceElement?.properties.choices?.map((choice, index) => {
      const result = { label: choice[language], value: `${choiceElement.id}.${index}` };
      return result;
    });
  }, [choiceElement, language]);

  // Filter out choices that are already used in other rules
  const usedChoices = nextActions
    .map((action) => (action.choiceId && action.choiceId !== choiceId ? action.choiceId : null))
    .filter(Boolean);
  const filteredChoices = choices?.filter((choice) => !usedChoices.includes(choice.value));

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

  // Check if the nextActions array has a catch all rule
  const catchAllRule = nextActions.find(
    (action) => action.choiceId.includes("catch-all") && choiceId && !choiceId.includes("catch-all")
  );

  if (!filteredChoices?.length && catchAllRule) {
    return null;
  }

  return (
    <div className="px-4">
      {filteredChoices && (
        <fieldset className="mb-4 border-b border-dotted border-slate-500">
          <div className="mb-4">
            <ChoiceSelect
              selected={choiceId}
              choices={filteredChoices}
              onChange={handleChoiceChange}
              addCatchAll={catchAllRule ? false : true}
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
    </div>
  );
};

const MultiActionSelectorInner = ({
  item,
  sectionName,
  descriptionId,
  initialNextActionRules,
  lang,
}: {
  item: FormElement;
  sectionName: string | null;
  descriptionId?: string;
  initialNextActionRules: NextActionRule[];
  lang: Language;
}) => {
  const [nextActions, setNextActions] = useState(() =>
    filterNextActionRulesForItem(item.id, initialNextActionRules)
  );
  const [invalidRule, setInvalidRule] = useState<{ source: string; target: string } | null>(null);
  const findParentGroup = useGroupStore((state) => state.findParentGroup);
  const getGroups = useGroupStore((state) => state.getGroups);
  const setGroupNextAction = useGroupStore((state) => state.setGroupNextAction);
  const setChangeKey = useTemplateStore((s) => s.setChangeKey);

  const { localizeField, language } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    language: s.translationLanguagePriority,
  }));

  const { saveDraftIfNeeded } = useTemplateContext();

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
  const formId = `form-${useId()}`;
  const { flow } = useFlowRef();

  const title = item
    ? item.properties[localizeField(LocalizedElementProperties.TITLE, language)]
    : "";

  const nextActionSelectors: React.JSX.Element[] | null = [];

  nextActions.forEach((action, index) => {
    const el = (
      <GroupAndChoiceSelect
        index={index}
        item={item}
        key={`${action.choiceId}-${index}`}
        groupId={action.groupId}
        choiceId={action.choiceId}
        updateGroupId={updateGroupId}
        updateChoiceId={updateChoiceId}
        removeSelector={removeSelector}
        nextActions={nextActions}
      />
    );

    nextActionSelectors.push(el);
  });

  const disableAdd = nextActions.some((action) => action.choiceId.includes("catch-all"));

  const handleSaveRules = () => {
    // Resolve the page that owns this question and keep only its branch rules.
    const group = findParentGroup(String(item.id));
    const parent = group?.index ? String(group.index) : undefined;
    const filteredNextActions = filterNextActionRulesForItem(item.id, nextActions);
    const groups = getGroups() as GroupsType;

    // Test the proposed rule set before updating the shared form state.
    const createsCycle =
      !!parent && !!groups[parent] && createsNextActionCycle(groups, parent, filteredNextActions);

    // Find the first rule whose removal makes the complete rule set cycle-free.
    const invalidAction = createsCycle
      ? filteredNextActions.find(
          (action) =>
            !createsNextActionCycle(
              groups,
              parent,
              filteredNextActions.filter((candidate) => candidate !== action)
            )
        ) || filteredNextActions[0]
      : undefined;

    if (invalidAction) {
      // Restore the last saved rules and explain which destination caused the rejection.
      setNextActions(filterNextActionRulesForItem(item.id, initialNextActionRules));
      setInvalidRule({
        source: sectionName || parent || "",
        target: groups[invalidAction.groupId]?.name || invalidAction.groupId,
      });
      return;
    }

    // Persist the valid rules, redraw the flow, and save the draft.
    parent && setGroupNextAction(parent, filteredNextActions);
    setChangeKey(String(new Date().getTime()));
    flow.current?.redraw();
    saveDraftIfNeeded();
    toast.success(t("logic.actionsSaved"));
  };

  return (
    <>
      <div className="sticky top-0 flex justify-between border-b-2 border-black bg-gray-50 p-3 align-middle">
        <div>
          <SectionName lang={lang} sectionName={sectionName} />
          <h3 className="mt-2 mb-6 ml-2 block text-sm font-normal">
            {t("logic.questionTitle")} <strong> {title}</strong>
          </h3>

          <label className="flex items-center hover:fill-white hover:underline">
            <span className="mr-2 pl-3 text-sm">{t("logic.addRule")}</span>
            <Button
              theme="secondary"
              className="p-0 hover:bg-indigo-500! hover:fill-white! focus:fill-white!"
              disabled={disableAdd}
              onClick={() => {
                setNextActions([...nextActions, { groupId: "", choiceId: String(item.id) }]);
              }}
            >
              <AddIcon className="hover:fill-white focus:fill-white" title={t("logic.addRule")} />
            </Button>
          </label>
        </div>
      </div>

      <form
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
        id={formId}
        {...(descriptionId && { "aria-describedby": descriptionId })}
      >
        <div className="mb-6" aria-live="polite" aria-relevant="all">
          {nextActionSelectors}
        </div>
        <div className="mb-6 px-4">
          <SaveNote />
          <Button
            className={cn("px-4 py-1", nextActions.length === 0 && "disabled")}
            disabled={nextActions.length === 0}
            onClick={handleSaveRules}
          >
            {t("logic.saveRule")}
          </Button>
        </div>
      </form>
      {invalidRule && (
        <InvalidNextActionDialog {...invalidRule} handleClose={() => setInvalidRule(null)} />
      )}
    </>
  );
};

export const MultiActionSelector = (props: {
  item: FormElement;
  sectionName: string | null;
  descriptionId?: string;
  initialNextActionRules: NextActionRule[];
  lang: Language;
}) => {
  const stateKey = `${props.item.id}:${JSON.stringify(props.initialNextActionRules)}`;

  return <MultiActionSelectorInner key={stateKey} {...props} />;
};
