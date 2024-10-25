"use client";;
import React, { ReactElement, useRef, useState } from "react";
import { useTranslation } from "@i18n/client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Option } from "./Option";
import { Button } from "@clientComponents/globals";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { ModalRules } from "../ModalRules";
import { ConditionalIndicatorOption } from "@formBuilder/components/shared";

interface AddButtonProps {
  index?: number;
  onClick?(...args: unknown[]): unknown;
}

const AddButton = ({
  index,
  onClick
}: AddButtonProps) => {
  const { t } = useTranslation("form-builder");
  return (
    <Button
      className="!m-0 !mt-4"
      theme="link"
      id={`add-option-${index}`}
      onClick={() => {
        onClick(index);
      }}
    >
      {t("addOption")}
    </Button>
  );
};

interface AddOptionsProps {
  index?: number;
}

const AddOptions = ({
  index
}: AddOptionsProps) => {
  const { addChoice, setFocusInput } = useTemplateStore((s) => ({
    addChoice: s.addChoice,
    setFocusInput: s.setFocusInput,
  }));

  return (
    <>
      <AddButton
        index={index}
        onClick={() => {
          setFocusInput(true);
          addChoice(index);
        }}
      />
    </>
  );
};

type RenderIcon = (index: number) => ReactElement | string | undefined;

interface OptionsProps {
  item?: object;
  renderIcon?(...args: unknown[]): unknown;
}

export const Options = ({
  item,
  renderIcon,
  formId
}: OptionsProps) => {
  const { elements, translationLanguagePriority } = useTemplateStore((s) => ({
    elements: s.form.elements,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const parentIndex = elements.findIndex((element) => element.id === item.id);
  const element = elements.find((element) => element.id === item.id);

  const modalContainer = useRef<HTMLDivElement>(null);
  const [focusedOption, setFocusedOption] = useState<string | null>(null);
  // Track the mode of the modal for adding or editing rules
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const timeout = useRef<number | null>(null); // add interval to add timeout to be cleared

  if (!element?.properties) {
    return null;
  }
  const { choices } = element.properties;

  if (!choices) {
    return <AddOptions index={parentIndex} />;
  }

  const options = choices.map((child, index) => {
    if (!child || !item) return null;

    const initialValue = element.properties.choices?.[index][translationLanguagePriority] ?? "";

    return (
      <fieldset key={`child-${item.id}-${index}`} aria-live="polite">
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
          handleOpen={(mode) => {
            setModalMode(mode);
            // @ts-expect-error -- div is using imperative handle
            modalContainer.current?.showModal();
          }}
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
          <AddOptions index={parentIndex} />
        </div>
      </div>
      <div>
        <ModalRules
          mode={modalMode}
          focusedOption={focusedOption}
          modalRef={modalContainer}
          item={item}
          formId={formId}
        />
      </div>
    </div>
  );
};
