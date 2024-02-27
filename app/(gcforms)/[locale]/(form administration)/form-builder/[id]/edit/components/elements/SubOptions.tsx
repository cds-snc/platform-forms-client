"use client";
import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { SubOption } from "./SubOption";
import { Button } from "@clientComponents/globals";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

const AddButton = ({
  elIndex,
  onClick,
}: {
  elIndex: number;
  onClick: (elIndex: number) => void;
}) => {
  const { t } = useTranslation("form-builder");
  return (
    <Button
      className="!m-0 !mt-4"
      theme="link"
      id={`sub-add-option-${elIndex}`}
      onClick={() => {
        onClick(elIndex);
      }}
    >
      {t("addOption")}
    </Button>
  );
};

const AddOptions = ({ elIndex, subIndex }: { elIndex: number; subIndex: number }) => {
  const { addSubChoice, setFocusInput } = useTemplateStore((s) => ({
    addSubChoice: s.addSubChoice,
    setFocusInput: s.setFocusInput,
  }));

  return (
    <>
      <AddButton
        elIndex={elIndex}
        onClick={() => {
          setFocusInput(true);
          addSubChoice(elIndex, subIndex);
        }}
      />
    </>
  );
};

type RenderIcon = (index: number) => ReactElement | string | undefined;

export const SubOptions = ({
  item,
  elIndex,
  renderIcon,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  renderIcon?: RenderIcon;
}) => {
  const { elements, translationLanguagePriority } = useTemplateStore((s) => ({
    elements: s.form.elements,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const subIndex = item.index;
  // get choices from the parent element
  const subElements = elements[elIndex].properties.subElements ?? [];
  const choices = subElements[subIndex]?.properties.choices?.length
    ? subElements[subIndex]?.properties.choices
    : [{ en: "", fr: "" }];

  if (!choices) {
    return <AddOptions elIndex={elIndex} subIndex={subIndex} />;
  }

  const options = choices.map((child, choiceIndex) => {
    if (!child || !item) return null;

    const initialValue = choices?.[choiceIndex][translationLanguagePriority] ?? "";

    return (
      <div key={`child-${item.id}-${choiceIndex}`}>
        <SubOption
          renderIcon={renderIcon}
          elIndex={elIndex}
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
      <AddOptions elIndex={elIndex} subIndex={subIndex} />
    </div>
  );
};
