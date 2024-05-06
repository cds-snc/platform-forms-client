"use client";
import React from "react";
import {
  FormElementWithIndex,
  LocalizedElementProperties,
  Language,
} from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { QuestionInput, QuestionNumber } from "..";

export const Question = ({
  item,
  onQuestionChange,
  describedById,
}: {
  item: FormElementWithIndex;
  onQuestionChange: (itemId: number, val: string, lang: Language) => void;
  describedById?: string;
}) => {
  const { localizeField, translationLanguagePriority, getGroupsEnabled } = useTemplateStore(
    (s) => ({
      localizeField: s.localizeField,
      translationLanguagePriority: s.translationLanguagePriority,
      getGroupsEnabled: s.getGroupsEnabled,
    })
  );

  const groupsEnabled = getGroupsEnabled();

  const itemIndex = item.index;
  const isRichText = item.type === "richText";
  const properties = item.properties;
  const title =
    properties[localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)];

  return isRichText ? null : (
    <>
      {!groupsEnabled && <QuestionNumber index={itemIndex} questionNumber={item.questionNumber} />}
      <QuestionInput
        initialValue={title}
        index={itemIndex}
        id={item.id}
        describedById={describedById}
        onQuestionChange={onQuestionChange}
      />
    </>
  );
};
