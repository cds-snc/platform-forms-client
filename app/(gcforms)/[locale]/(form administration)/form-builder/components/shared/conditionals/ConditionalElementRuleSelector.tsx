"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";
import { cn } from "@lib/utils";
import { FormElement } from "@lib/types";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { QuestionSelector, type SelectorResult } from "../QuestionSelector";

type Choice = {
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
      <label className="mb-2 inline-block text-sm font-bold" id={labelId}>
        {t("addConditionalRules.optionTitle")}
      </label>
      <select
        value={selected}
        data-selected={selected}
        onChange={onChange}
        className={cn(
          "form-builder-dropdown text-black-default my-0 inline-block w-full max-w-[800px] appearance-none truncate rounded border-2 border-indigo-700 bg-white bg-[url('/img/form-builder-arrow-down.svg')] bg-position-[center_right_5px] bg-no-repeat p-2 pr-10",
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

export const ConditionalElementRuleSelector = ({
  itemId,
  elements,
  elementId,
  choiceId,
  index,
  updateChoiceId,
  updateElementId,
  removeSelector,
  isHighlighted,
}: {
  itemId: number;
  elements: FormElement[];
  elementId: string | null;
  choiceId: string | null;
  index: number;
  updateChoiceId: (index: number, id: string) => void;
  updateElementId: (index: number, id: string) => void;
  removeSelector: (index: number) => void;
  isHighlighted?: boolean;
}) => {
  "use memo";
  const selectorRef = useRef<HTMLFieldSetElement>(null);
  const [showHighlight, setShowHighlight] = useState(Boolean(isHighlighted));
  const currentElement = elements.find((el) => el.id === itemId);

  const { t } = useTranslation("form-builder");

  const { translationLanguagePriority } = useTemplateStore((s) => ({
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const language = translationLanguagePriority;

  const currentRules = currentElement?.properties.conditionalRules || [];

  const choiceParentQuestion = choiceId?.split(".")[0] || null;

  // The selected element "parent" of the choice
  const selectedElement = elements.find((element) => element.id === Number(choiceParentQuestion));

  const choices = selectedElement?.properties.choices?.map((choice, index) => {
    return { label: choice[language], value: `${choiceParentQuestion}.${index}` };
  });

  const handleQuestionResult = (result: SelectorResult) => {
    if ("element" in result) {
      updateElementId(index, String(result.element.id));
    }
  };

  const handleChoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    updateChoiceId(index, value);
  };

  const handleRemove = () => {
    removeSelector(index);
  };

  useEffect(() => {
    if (!showHighlight) {
      return;
    }

    // Scroll the selector into view and focus it when it is highlighted
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        selectorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        selectorRef.current?.querySelector<HTMLSelectElement>("select")?.focus({
          preventScroll: true,
        });
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [showHighlight]);

  useEffect(() => {
    if (!showHighlight) {
      return;
    }

    // Hide the highlight if the user clicks outside of the selector
    const handlePointerDown = (event: PointerEvent) => {
      if (!selectorRef.current?.contains(event.target as Node)) {
        setShowHighlight(false);
      }
    };

    // Hide the highlight if the user focuses outside of the selector
    const handleFocusIn = (event: FocusEvent) => {
      const selector = selectorRef.current;
      const focusMovedOutside =
        selector &&
        selector.contains(event.relatedTarget as Node) &&
        !selector.contains(event.target as Node);

      if (focusMovedOutside) {
        setShowHighlight(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [showHighlight]);

  return (
    <>
      {choices && (
        <fieldset
          ref={selectorRef}
          className={cn(
            "mb-2 border-b border-dotted border-slate-500 p-2",
            showHighlight && "rounded bg-violet-50/50 ring-2 ring-violet-400"
          )}
          data-highlighted={showHighlight || undefined}
        >
          <div className="mb-4">
            <ChoiceSelect selected={choiceId} choices={choices} onChange={handleChoiceChange} />
          </div>
          <div className="mb-4">
            <QuestionSelector
              initialValue={elementId}
              onResult={handleQuestionResult}
              excludeIds={[
                itemId,
                ...currentRules
                  .filter((rule) => rule.choiceId.split(".")[0] !== elementId)
                  .map((rule) => Number(rule.choiceId.split(".")[0])),
              ]}
              label={t("addConditionalRules.questionTitle")}
              className="my-2 mr-4"
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
