"use client";
import React, { ReactElement, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Option } from "./Option";
import { Button } from "@clientComponents/globals";
import { ChoiceOptionsCsvUpload } from "@clientComponents/forms/ChoiceOptionsCsvUpload";
import { FormElementTypes, type PropertyChoices } from "@lib/types";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { ConditionalIndicatorOption } from "@formBuilder/components/shared/conditionals/ConditionalIndicatorOption";
import { MAX_CHOICE_AMOUNT } from "@root/constants";

interface AddButtonProps {
  index: number;
  disabled?: boolean;
  onClick(...args: unknown[]): unknown;
}

const AddButton = ({ index, onClick, disabled }: AddButtonProps) => {
  const { t } = useTranslation("form-builder");
  return (
    <Button
      className="!m-0 !mt-4"
      theme="link"
      id={`add-option-${index}`}
      disabled={disabled}
      onClick={() => {
        onClick(index);
      }}
    >
      {t("addOption")}
    </Button>
  );
};

interface AddOptionsProps {
  index: number;
  choiceCount?: number;
  onImport?: (choices: PropertyChoices[]) => void;
}

const AddOptions = ({ index, choiceCount = 0, onImport }: AddOptionsProps) => {
  const { t } = useTranslation("form-builder");
  const { addChoice, setFocusInput } = useTemplateStore((s) => ({
    addChoice: s.addChoice,
    setFocusInput: s.setFocusInput,
  }));
  const isLimitReached = choiceCount >= MAX_CHOICE_AMOUNT;

  return (
    <div className="flex flex-wrap items-center gap-x-1">
      <AddButton
        index={index}
        disabled={isLimitReached}
        onClick={() => {
          setFocusInput(true);
          addChoice(index);
        }}
      />
      {isLimitReached && (
        <strong className="ml-2 inline-block text-sm font-bold text-red-700 mt-4">
          {t("choiceLimitReached", { maxChoices: MAX_CHOICE_AMOUNT })}
        </strong>
      )}
      {onImport && (
        <>
          <span className="mt-4 text-sm text-slate-700">{t("or")}</span>
          <ChoiceOptionsCsvUpload
            id={`choice-options-${index}`}
            onImport={(choices) => {
              setFocusInput(false);
              onImport(choices);
            }}
          />
        </>
      )}
    </div>
  );
};

type RenderIcon = ((index: number) => ReactElement | string) | undefined;

interface OptionsProps {
  item: FormElementWithIndex;
  renderIcon?: RenderIcon;
  formId: string;
}

export const Options = ({ item, renderIcon }: OptionsProps) => {
  const { elements, translationLanguagePriority, updateField } = useTemplateStore((s) => ({
    elements: s.form.elements,
    translationLanguagePriority: s.translationLanguagePriority,
    updateField: s.updateField,
  }));

  const parentIndex = elements.findIndex((element) => element.id === item.id);
  const element = elements.find((element) => element.id === item.id);

  const [focusedOption, setFocusedOption] = useState<string | null>(null);
  // Track the mode of the modal for adding or editing rules
  const timeout = useRef<number | null>(null); // add interval to add timeout to be cleared

  if (!element?.properties) {
    return null;
  }
  const { choices } = element.properties;
  const allowCsvUpload = [
    FormElementTypes.radio,
    FormElementTypes.checkbox,
    FormElementTypes.dropdown,
  ].some((type) => type === item.type);

  if (!item) return null;

  if (!choices || choices.length === 0) {
    return (
      <AddOptions
        index={parentIndex}
        choiceCount={choices?.length ?? 0}
        onImport={
          allowCsvUpload
            ? (importedChoices) => {
                updateField(`form.elements[${parentIndex}].properties`, {
                  ...element.properties,
                  choices: importedChoices,
                });
              }
            : undefined
        }
      />
    );
  }

  const options = choices.map((child, index) => {
    if (!child || !item) return null;

    const initialValue = element.properties.choices?.[index][translationLanguagePriority] ?? "";

    return (
      <fieldset key={`child-${item.id}-${index}-${translationLanguagePriority}`} aria-live="polite">
        <Option
          renderIcon={renderIcon}
          parentIndex={parentIndex}
          id={item.id}
          index={index}
          initialValue={initialValue}
          onFocus={() => {
            // Set focus state to show the link to open the modal
            timeout.current && clearTimeout(timeout.current);
            setFocusedOption(`${item.id}.${index}`);
          }}
          onBlur={
            // Set a timeout to allow the click event to fire
            // Once the focus is removed the link will be hidden
            () => {
              timeout.current = window.setTimeout(() => {
                setFocusedOption(null);
              }, 10000);
            }
          }
        />
        <ConditionalIndicatorOption
          itemId={item.id}
          isFocused={focusedOption === `${item.id}.${index}`}
          id={`${item.id}.${index}`}
          elements={elements}
        />
      </fieldset>
    );
  });

  return (
    <div className="mt-5">
      {options}
      <div className="mr-2 inline-block">
        <div className="mr-4 inline-block">
          <AddOptions index={parentIndex} choiceCount={choices.length} />
        </div>
      </div>
    </div>
  );
};
