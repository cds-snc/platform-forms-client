"use client";
import React, { useCallback } from "react";
import { useTranslation } from "@i18n/client";

import { useTemplateStore } from "@clientComponents/form-builder/store";
import { PanelBodySub } from "../../PanelBodySub";
import { FormElement, FormElementTypes } from "@lib/types";
import { AddElementButton } from "../element-dialog/AddElementButton";
import {
  LocalizedElementProperties,
  Language,
  ElementOptionsFilter,
} from "@clientComponents/form-builder/types";
import { SubElementModal } from "./SubElementModal";
import { PanelHightLight } from "./PanelHightlight";
import { PanelActions } from "../../PanelActions";
import {
  Input,
  LockedBadge,
} from "app/(gcforms)/[locale]/(form administration)/form-builder/components/shared";
import { getQuestionNumber } from "@clientComponents/form-builder/util";
import { useHandleAdd } from "hooks";

export const SubElement = ({ item, elIndex, ...props }: { item: FormElement; elIndex: number }) => {
  const { t } = useTranslation("form-builder");

  const {
    updateField,
    subMoveUp,
    subMoveDown,
    subDuplicateElement,
    removeSubItem,
    subElements,
    localizeField,
    translationLanguagePriority,
    getLocalizationAttribute,
    propertyPath,
  } = useTemplateStore((s) => ({
    updateField: s.updateField,
    subMoveUp: s.subMoveUp,
    subMoveDown: s.subMoveDown,
    subDuplicateElement: s.subDuplicateElement,
    removeSubItem: s.removeSubItem,
    subElements: s.form.elements[elIndex].properties.subElements,
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
    propertyPath: s.propertyPath,
  }));

  const { handleAddSubElement } = useHandleAdd();

  const handlePlaceHolderText = useCallback(
    (elIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
      const placeHolder = localizeField(
        LocalizedElementProperties.PLACEHOLDER,
        translationLanguagePriority
      );
      updateField(`form.elements[${elIndex}].properties.${placeHolder}`, e.target.value);
    },
    [updateField, localizeField, translationLanguagePriority]
  );

  const onQuestionChange = (itemId: number, val: string, lang: Language) => {
    updateField(propertyPath(itemId, LocalizedElementProperties.TITLE, lang), val);
  };

  const onRequiredChange = (itemId: number, checked: boolean) => {
    updateField(propertyPath(itemId, "validation.required"), checked);
  };

  const elementFilter: ElementOptionsFilter = (elements) => {
    const notAllowed = ["dynamicRow", "attestation"];
    return elements.filter((element) => !notAllowed.includes(element.id));
  };

  if (!subElements || subElements.length < 1)
    return (
      <div className="mt-10">
        <AddElementButton
          text={t("addToSet")}
          handleAdd={(type?: FormElementTypes) => {
            handleAddSubElement(elIndex, 0, type);
          }}
          filterElements={elementFilter}
        />
      </div>
    );

  // grab only the data we need to render the question number
  const subElementTypes = subElements.map((element) => ({ id: element.id, type: element.type }));

  return (
    <div {...props} className="mb-3 mt-3">
      {subElements.map((element, subIndex: number) => {
        const questionNumber = getQuestionNumber(element, subElementTypes, true);
        const item = { ...element, index: subIndex, questionNumber };
        return (
          <div key={`sub-element-${item.id}-${subIndex}`}>
            <PanelHightLight
              conditionalChildren={
                <PanelActions
                  isSubPanel={true}
                  isFirstItem={subIndex === 0}
                  isLastItem={subIndex === subElements.length - 1}
                  totalItems={subElements.length}
                  handleAdd={(type?: FormElementTypes) => {
                    handleAddSubElement(elIndex, subIndex, type);
                  }}
                  handleRemove={() => {
                    removeSubItem(elIndex, item.id);
                  }}
                  handleMoveUp={() => {
                    subMoveUp(elIndex, subIndex);
                  }}
                  handleMoveDown={() => {
                    subMoveDown(elIndex, subIndex);
                  }}
                  handleDuplicate={() => {
                    subDuplicateElement(elIndex, subIndex);
                  }}
                  moreButtonRenderer={(moreButton) => {
                    return (
                      <SubElementModal
                        elIndex={elIndex}
                        subIndex={subIndex}
                        item={{ ...item, index: item.id }}
                        moreButton={moreButton}
                      />
                    );
                  }}
                  filterElements={elementFilter}
                />
              }
            >
              <PanelBodySub
                elIndex={elIndex}
                item={item}
                onQuestionChange={onQuestionChange}
                onRequiredChange={onRequiredChange}
              />
            </PanelHightLight>
          </div>
        );
      })}

      {item.type === "dynamicRow" && (
        <div className="mt-4 h-auto max-w-[800px] border-1 border-gray-300 first-of-type:rounded-t-md last-of-type:rounded-b-md">
          <LockedBadge className="laptop:absolute laptop:right-7 laptop:top-[15px]" />
          <div className="mx-7 mb-7 mt-5">
            <h2 className="pb-3 text-2xl">{t("questionSet.addAnother.title")}</h2>
            <p className="mb-8 pt-5 text-[1rem]">{t("questionSet.addAnother.description")}</p>
            <Input
              id={`repeatable-button-${elIndex}`}
              {...getLocalizationAttribute()}
              key={`repeatable-button-${elIndex}-${translationLanguagePriority}`}
              value={
                item.properties[
                  localizeField(LocalizedElementProperties.PLACEHOLDER, translationLanguagePriority)
                ] || ""
              }
              className="w-full"
              placeholder={t("questionSet.addAnother.placeholder")}
              onChange={(e) => {
                handlePlaceHolderText(elIndex, e);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
