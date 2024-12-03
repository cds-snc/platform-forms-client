"use client";
import React, { ReactElement } from "react";
import { useTranslation } from "@i18n/client";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { SubOption } from "./SubOption";
import { Button } from "@clientComponents/globals";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

const AddButton = ({ elId, onClick }: { elId: number; onClick: (elId: number) => void }) => {
  const { t } = useTranslation("form-builder");
  return (
    <Button
      className="!m-0 !mt-4"
      theme="link"
      id={`sub-add-option-${elId}`}
      onClick={() => {
        onClick(elId);
      }}
    >
      {t("addOption")}
    </Button>
  );
};

const AddOptions = ({ elId, subIndex }: { elId: number; subIndex: number }) => {
  const { addSubChoice, setFocusInput, setChangeKey } = useTemplateStore((s) => ({
    addSubChoice: s.addSubChoice,
    setFocusInput: s.setFocusInput,
    setChangeKey: s.setChangeKey,
  }));

  return (
    <>
      <AddButton
        elId={elId}
        onClick={() => {
          setFocusInput(true);
          addSubChoice(elId, subIndex);
          setChangeKey(String(new Date().getTime()));
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
  const { translationLanguagePriority, getFormElementById } = useTemplateStore((s) => ({
    translationLanguagePriority: s.translationLanguagePriority,
    getFormElementById: s.getFormElementById,
  }));

  const subIndex = item.index;

  const element = getFormElementById(item.id);
  const choices = element?.properties.choices || [{ en: "", fr: "" }];

  if (!choices) {
    return <AddOptions elId={item.id} subIndex={subIndex} />;
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
      <AddOptions elId={item.id} subIndex={subIndex} />
    </div>
  );
};
