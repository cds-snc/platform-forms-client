"use client";
import React, { useId } from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { FormElement } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { LocalizedFormProperties, LocalizedElementProperties } from "@lib/types/form-builder-types";
import { toPlainText } from "@lib/utils/strings";

type Choice = {
  label: string;
  value: string;
};

type Question = {
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
  const labelId = `choice-select-${useId()}`;

  if (!selected || selected === "1") {
    selected = "1.0";
  }

  return (
    <div className="my-2 mr-4 flex flex-col">
      <label className="mb-2 inline-block text-sm" id={labelId}>
        {t("addConditionalRules.optionTitle")}
      </label>
      <select
        value={selected}
        data-selected={selected}
        onChange={onChange}
        className={cn(
          "center-right-15px form-builder-dropdown text-black-default my-0 inline-block w-[300px] border-1 border-black p-2",
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

const QuestionSelect = ({
  selected,
  questions,
  onChange,
  className,
}: {
  selected: string | null;
  questions: Question[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}) => {
  const { t } = useTranslation("form-builder");
  const labelId = `question-select-${useId()}`;

  return (
    <div className="mb-4">
      <h4 className="mb-2" id={labelId}>
        {t("addConditionalRules.questionTitle")}
      </h4>
      <select
        value={selected || ""}
        data-selected={selected || ""}
        onChange={onChange}
        className={cn(
          "center-right-15px form-builder-dropdown text-black-default my-0 inline-block w-[300px] border-1 border-black p-2",
          className
        )}
        aria-labelledby={labelId}
      >
        {questions.map(({ label, value }) => {
          return (
            <option key={value} value={value}>
              {toPlainText(label)}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export const ConditionalElementRuleSelector = ({
  itemId,
  elements,
  elementId,
  choiceId,
  index,
  updateChoiceId,
  updateElementId,
  removeSelector,
}: {
  itemId: number;
  elements: FormElement[];
  elementId: string | null;
  choiceId: string | null;
  index: number;
  updateChoiceId: (index: number, id: string) => void;
  updateElementId: (index: number, id: string) => void;
  removeSelector: (index: number) => void;
}) => {
  "use memo";
  const currentElement = elements.find((el) => el.id === itemId);

  const { t } = useTranslation("form-builder");

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const language = translationLanguagePriority;

  const currentRules = currentElement?.properties.conditionalRules || [];

  const questions = elements
    .filter((item) => {
      return (
        item.id !== itemId &&
        // Prevent creating circular logic by filtering out questions
        // that already have rules pointing to the current element.
        !currentRules.some((rule) => rule.choiceId.split(".")[0] === String(item.id))
      );
    })
    .map((question) => {
      const titleKey = localizeField(LocalizedFormProperties.TITLE, language);
      const descKey = localizeField(LocalizedElementProperties.DESCRIPTION, language);

      let label = "";
      if (question.properties[titleKey]) {
        label = question.properties[titleKey] || "";
      }

      if (label === "" && question.properties[descKey]) {
        label = question.properties[descKey] || "";
      }

      return { label, value: `${question.id}` };
    });

  questions.unshift({ label: t("addConditionalRules.selectQuestion"), value: "" });

  const choiceParentQuestion = choiceId?.split(".")[0] || null;

  // The selected element "parent" of the choice
  const selectedElement = elements.find((element) => element.id === Number(choiceParentQuestion));

  const choices = selectedElement?.properties.choices?.map((choice, index) => {
    return { label: choice[language], value: `${choiceParentQuestion}.${index}` };
  });

  const handleQuestionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateElementId(index, value);
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
        <fieldset className="mb-2 border-b border-dotted border-slate-500">
          <div className="mb-4">
            <ChoiceSelect selected={choiceId} choices={choices} onChange={handleChoiceChange} />
          </div>
          <div className="mb-4">
            <QuestionSelect
              selected={elementId}
              questions={questions}
              onChange={handleQuestionChange}
            />
          </div>
          <Button className="mb-8 inline-block text-sm" theme="link" onClick={handleRemove}>
            {t("addConditionalRules.removeRule")}
          </Button>
        </fieldset>
      )}
    </>
  );
};
