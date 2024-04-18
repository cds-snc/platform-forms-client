"use client";
import React, { useMemo } from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { FormElement } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { GroupsType } from "@lib/formContext";

type Choice = {
  label: string;
  value: string;
};

type GroupItem = {
  label: string;
  value: string;
};

const ChoiceSelect = ({
  selected,
  choices,
  onChange,
  className,
}: {
  selected: string | null;
  choices: Choice[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  const { t } = useTranslation("form-builder");
  const labelId = `choice-select-${Date.now()}`;

  if (!selected || selected === "1") {
    selected = "1.0";
  }

  return (
    <div className="my-4 mr-4 flex flex-col">
      <div className="mb-2">
        <h4 className="mb-2" id={labelId}>
          {t("addConditionalRules.optionTitle")}
        </h4>
      </div>
      <select
        value={selected}
        data-selected={selected}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[300px] text-black-default",
          className
        )}
        aria-labelledby={labelId}
      >
        {choices.map(({ label, value }) => {
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

const GroupSelect = ({
  selected,
  groups,
  onChange,
  className,
}: {
  selected: string | null;
  groups: GroupItem[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  const labelId = `section-select-${Date.now()}`;

  return (
    <div className="mb-4">
      <h4 className="mb-2" id={labelId}>
        Go to section
      </h4>
      <select
        value={selected || ""}
        data-selected={selected || ""}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[300px] text-black-default",
          className
        )}
        aria-labelledby={labelId}
      >
        {groups.map(({ label, value }) => {
          return (
            <option key={value} value={value}>
              {label}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export const NextActionSelector = ({
  elements,
  groupId,
  choiceId,
  index,
  updateChoiceId,
  updateGroupId,
  removeSelector,
}: {
  elements: FormElement[];
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

  const formGroups: GroupsType = useTemplateStore((s) => s.form.groups) || {};
  const groupItems = Object.keys(formGroups).map((key) => {
    const item = formGroups[key];
    return { label: item.name, value: key };
  });

  const choiceParentQuestion = choiceId?.split(".")[0] || null;

  // The selected element "parent" of the choice
  const selectedElement = useMemo(
    () => elements.find((element) => element.id === Number(choiceParentQuestion)),
    [choiceParentQuestion, elements]
  );

  const choices = useMemo(() => {
    return selectedElement?.properties.choices?.map((choice, index) => {
      const result = { label: choice[language], value: `${choiceParentQuestion}.${index}` };
      return result;
    });
  }, [selectedElement, choiceParentQuestion, language]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
            <GroupSelect selected={groupId} groups={groupItems} onChange={handleQuestionChange} />
          </div>
          <Button className="mb-8 inline-block" theme="link" onClick={handleRemove}>
            {t("addConditionalRules.removeRule")}
          </Button>
        </fieldset>
      )}
    </>
  );
};
