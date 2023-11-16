import React, { useMemo, useState } from "react";
import { useTranslation } from "next-i18next";
import { cn } from "@lib/utils";
import { FormElement } from "@lib/types";

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

  if (!selected || selected === "1") {
    selected = "1.0";
  }

  return (
    <div className="my-4 mr-4 flex flex-col">
      <div className="mb-2">
        <h4 className="mb-2">{t("addConditionalRules.optionTitle")}</h4>
      </div>
      <select
        value={selected}
        data-selected={selected}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[300px] text-black-default",
          className
        )}
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

  return (
    <div className="mb-4">
      <h4 className="mb-2">{t("addConditionalRules.questionTitle")}</h4>
      <select
        value={selected || ""}
        data-selected={selected || ""}
        onChange={onChange}
        className={cn(
          "center-right-15px inline-block p-2 border-black border-1 form-builder-dropdown my-0 w-[300px] text-black-default",
          className
        )}
      >
        {questions.map(({ label, value }) => {
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

export const ConditionalSelector = ({
  elements,
  questionId,
  choiceId,
  setConditional,
}: {
  elements: FormElement[];
  questionId: string | null;
  choiceId: string | null;
  setConditional: (selectedChoice: string | null, selectedQuestion: string | null) => void;
}) => {
  const questions = useMemo(() => {
    const validType = ["textField", "textArea"];
    const items = elements
      .filter((element) => validType.includes(element.type))
      .map((question) => {
        const result = { label: question.properties.titleEn, value: `${question.id}` };
        return result;
      });

    // Prepend empty option
    items.unshift({ label: "", value: "" });
    return items;
  }, [elements]);

  const choiceParentQuestion = choiceId?.split(".")[0] || null;

  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(questionId);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(choiceId);

  // The selected element "parent" of the choice
  const selectedElement = useMemo(
    () => elements.find((element) => element.id === Number(choiceParentQuestion)),
    [choiceParentQuestion, elements]
  );

  const choices = useMemo(() => {
    return selectedElement?.properties.choices?.map((choice, index) => {
      const result = { label: choice.en, value: `${choiceParentQuestion}.${index}` };
      return result;
    });
  }, [selectedElement, choiceParentQuestion]);

  const handleQuestionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const questionId = e.target.value;

    if (!questionId) {
      setSelectedQuestion(null);
      return;
    }
    setSelectedQuestion(questionId);
    setConditional(selectedChoice, questionId);
  };

  const handleChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;

    setSelectedChoice(value);
    setConditional(value, selectedQuestion);
  };

  return (
    <>
      {choices && (
        <div className="border-b border-dotted border-slate-500">
          <div className="mb-4">
            <ChoiceSelect
              selected={selectedChoice}
              choices={choices}
              onChange={handleChoiceChange}
            />
          </div>
          <div className="mb-8">
            <QuestionSelect
              selected={selectedQuestion}
              questions={questions}
              onChange={handleQuestionChange}
            />
          </div>
        </div>
      )}
    </>
  );
};
