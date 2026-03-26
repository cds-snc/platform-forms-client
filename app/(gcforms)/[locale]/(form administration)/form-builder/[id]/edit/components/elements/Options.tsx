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
import { CopyChoiceOptionsCsvButton } from "@formBuilder/[id]/edit/components/CopyChoiceOptionsCsvButton";
import { ClearOptionsDialog } from "./ClearOptionsDialog";
import { toast } from "@formBuilder/components/shared/Toast";

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
  copyChoices?: PropertyChoices[];
  onImport?: (choices: PropertyChoices[]) => void;
  onClear?: () => void;
}

const AddOptions = ({
  index,
  choiceCount = 0,
  copyChoices,
  onImport,
  onClear,
}: AddOptionsProps) => {
  const { t } = useTranslation("form-builder");
  const { addChoice, setFocusInput } = useTemplateStore((s) => ({
    addChoice: s.addChoice,
    setFocusInput: s.setFocusInput,
  }));
  const isLimitReached = choiceCount >= MAX_CHOICE_AMOUNT;
  const choiceLimitReachedMessage = t("choiceLimitReached", { maxChoices: MAX_CHOICE_AMOUNT });

  return (
    <div className="flex flex-col items-start gap-y-3">
      <div className="flex flex-wrap items-center gap-x-1">
        <div className="flex items-center gap-x-6">
          <AddButton
            index={index}
            disabled={isLimitReached}
            onClick={() => {
              setFocusInput(true);
              addChoice(index);
            }}
          />
          <CopyChoiceOptionsCsvButton choices={copyChoices} />
        </div>

        <div aria-live="polite">
          {isLimitReached && (
            <strong className={`mt-4 inline-block text-sm font-bold text-red-700`}>
              {choiceLimitReachedMessage}
            </strong>
          )}
        </div>

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
      {onClear && (
        <Button className="!m-0" theme="link" onClick={onClear}>
          {t("clearOptions.button")}
        </Button>
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
  const { t } = useTranslation("form-builder");
  const {
    elements,
    translationLanguagePriority,
    updateField,
    removeChoice,
    removeChoiceFromRules,
    removeChoiceFromNextActions,
  } = useTemplateStore((s) => ({
    elements: s.form.elements,
    translationLanguagePriority: s.translationLanguagePriority,
    updateField: s.updateField,
    removeChoice: s.removeChoice,
    removeChoiceFromRules: s.removeChoiceFromRules,
    removeChoiceFromNextActions: s.removeChoiceFromNextActions,
  }));

  const parentIndex = elements.findIndex((element) => element.id === item.id);
  const element = elements.find((element) => element.id === item.id);

  const [focusedOption, setFocusedOption] = useState<string | null>(null);
  const [showClearDialog, setShowClearDialog] = useState(false);
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
    FormElementTypes.combobox,
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
                toast.success(
                  t("choiceOptionsUpload.successNotice", { count: importedChoices.length })
                );
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

  const clearOptions = () => {
    for (let index = choices.length - 1; index >= 0; index -= 1) {
      removeChoiceFromRules(String(item.id), index);
      removeChoiceFromNextActions(String(item.id), index);
      removeChoice(parentIndex, index);
    }

    setShowClearDialog(false);
    toast.success(t("clearOptions.successToast"));
  };

  return (
    <div className="mt-5">
      {options}
      <AddOptions
        index={parentIndex}
        choiceCount={choices.length}
        copyChoices={choices}
        onClear={() => {
          setShowClearDialog(true);
        }}
      />
      {showClearDialog && (
        <ClearOptionsDialog onConfirm={clearOptions} onClose={() => setShowClearDialog(false)} />
      )}
    </div>
  );
};
