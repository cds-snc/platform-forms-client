"use client";
import React, { ReactElement, useRef } from "react";
import PropTypes from "prop-types";
import { useTranslation } from "@i18n/client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Option } from "./Option";
import { Button } from "@clientComponents/globals";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { ModalRules } from "../ModalRules";
import { ConditionalIndicatorOption } from "@formBuilder/components/shared";
import { AddOther } from "@formBuilder/components/shared/conditionals/AddOther";

const AddButton = ({ index, onClick }: { index: number; onClick: (index: number) => void }) => {
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

AddButton.propTypes = {
  index: PropTypes.number,
  onClick: PropTypes.func,
};

const AddOptions = ({ index }: { index: number }) => {
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

AddOptions.propTypes = {
  index: PropTypes.number,
};

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const Options = ({
  item,
  renderIcon,
}: {
  item: FormElementWithIndex;
  renderIcon?: RenderIcon;
}) => {
  const { elements, translationLanguagePriority } = useTemplateStore((s) => ({
    elements: s.form.elements,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const parentIndex = elements.findIndex((element) => element.id === item.id);
  const element = elements.find((element) => element.id === item.id);

  const [focusedOption, setFocusedOption] = React.useState<string | null>(null);
  const modalContainer = useRef<HTMLDivElement>(null);

  const timeout = React.useRef<number | null>(null); // add interval to add timeout to be cleared

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
            timeout.current && clearTimeout(timeout.current);
            setFocusedOption(`${item.id}.${index}`);
          }}
          onBlur={
            // Set a timeout to allow the click event to fire before the focus is set
            () => {
              timeout.current = window.setTimeout(() => {
                setFocusedOption(null);
              }, 10000);
            }
          }
        />
        <ConditionalIndicatorOption
          handleOpen={() => {
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
        <AddOther item={item} />
      </div>
      <div>
        <ModalRules modalRef={modalContainer} item={item} />
      </div>
    </div>
  );
};

Options.propTypes = {
  item: PropTypes.object,
  renderIcon: PropTypes.func,
};
