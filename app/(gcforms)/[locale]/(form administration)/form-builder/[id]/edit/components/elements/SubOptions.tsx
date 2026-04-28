"use client";
import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { SubOption } from "./SubOption";
import { Button } from "@clientComponents/globals";
import { ChoiceOptionsCsvUpload } from "@clientComponents/forms/ChoiceOptionsCsvUpload";
import { FormElementTypes, type PropertyChoices } from "@lib/types";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { MAX_CHOICE_AMOUNT } from "@root/constants";
import { CopyChoiceOptionsCsvButton } from "@formBuilder/[id]/edit/components/CopyChoiceOptionsCsvButton";
import { toast } from "@formBuilder/components/shared/Toast";

const AddOption = ({
  elId,
  subIndex,
  choiceCount,
  copyChoices,
  onImport,
}: {
  elId: number;
  subIndex: number;
  choiceCount?: number;
  copyChoices?: PropertyChoices[];
  onImport?: (choices: PropertyChoices[]) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const { addSubChoice, setFocusInput, setChangeKey } = useTemplateStore((s) => ({
    addSubChoice: s.addSubChoice,
    setFocusInput: s.setFocusInput,
    setChangeKey: s.setChangeKey,
  }));
  const isLimitReached = (choiceCount ?? 0) >= MAX_CHOICE_AMOUNT;
  const choiceLimitReachedMessage = t("choiceLimitReached", { maxChoices: MAX_CHOICE_AMOUNT });

  return (
    <div className="flex flex-wrap items-center gap-x-1">
      <div className="flex items-center gap-x-6">
        <Button
          className="!m-0 !mt-4"
          theme="link"
          id={`sub-add-option-${elId}`}
          disabled={isLimitReached}
          onClick={() => {
            setFocusInput(true);
            addSubChoice(elId, subIndex);
            setChangeKey(String(new Date().getTime()));
          }}
        >
          {t("addOption")}
        </Button>
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
            id={`sub-choice-options-${elId}-${subIndex}`}
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

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const SubOptions = ({
  item,
  renderIcon,
}: {
  item: FormElementWithIndex;
  renderIcon?: RenderIcon;
}) => {
  const { t } = useTranslation("form-builder");
  const {
    translationLanguagePriority,
    getFormElementById,
    getFormElementIndexes,
    updateField,
    setChangeKey,
  } = useTemplateStore((s) => ({
    translationLanguagePriority: s.translationLanguagePriority,
    getFormElementById: s.getFormElementById,
    getFormElementIndexes: s.getFormElementIndexes,
    updateField: s.updateField,
    setChangeKey: s.setChangeKey,
  }));

  const subIndex = item.index;

  const element = getFormElementById(item.id);
  const choices = element?.properties.choices;
  const indexes = getFormElementIndexes(item.id);
  const allowCsvUpload = [
    FormElementTypes.radio,
    FormElementTypes.checkbox,
    FormElementTypes.dropdown,
    FormElementTypes.combobox,
  ].some((type) => type === item.type);

  if (!choices || choices.length === 0) {
    return (
      <AddOption
        elId={item.id}
        subIndex={subIndex}
        choiceCount={choices?.length ?? 0}
        onImport={
          allowCsvUpload
            ? (importedChoices) => {
                if (indexes.length < 1 || !element) {
                  return;
                }

                updateField(
                  `form.elements[${Number(indexes[0])}].properties.subElements[${subIndex}].properties`,
                  {
                    ...element.properties,
                    choices: importedChoices,
                  }
                );
                setChangeKey(String(new Date().getTime()));
                toast.success(
                  t("choiceOptionsUpload.successNotice", { count: importedChoices.length })
                );
              }
            : undefined
        }
      />
    );
  }

  const options = choices.map((child, choiceIndex) => {
    if (!child || !item) return null;

    const initialValue = choices?.[choiceIndex][translationLanguagePriority] ?? "";

    return (
      <div key={`child-${item.id}-${choiceIndex}-${translationLanguagePriority}`}>
        <SubOption
          renderIcon={renderIcon}
          subIndex={item.index}
          id={item.id}
          index={choiceIndex}
          initialValue={initialValue}
        />
      </div>
    );
  });

  return (
    <div className="mt-5">
      {options}
      <AddOption
        elId={item.id}
        subIndex={subIndex}
        choiceCount={choices.length}
        copyChoices={choices}
      />
    </div>
  );
};
