import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useTemplateStore } from "../../../../store";
import { PanelBodySub } from "../../PanelBodySub";
import { FormElement, FormElementTypes } from "@lib/types";
import { AddElementButton } from "../element-dialog/AddElementButton";
import { LocalizedElementProperties, Language, ElementOptionsFilter } from "../../../../types";
import { SubElementModal } from "./SubElementModal";
import { PanelHightLight } from "./PanelHightlight";
import { PanelActions } from "../../PanelActions";
import { Input, LockedBadge } from "@formbuilder/app/shared";
import { useUpdateElement } from "../../../../hooks";
import { blockLoader, LoaderType } from "../../../../blockLoader";
import { allowedTemplates, getQuestionNumber } from "@formbuilder/util";

export const SubElement = ({ item, elIndex, ...props }: { item: FormElement; elIndex: number }) => {
  const { t } = useTranslation("form-builder");

  const {
    addSubItem,
    updateField,
    subMoveUp,
    subMoveDown,
    subDuplicateElement,
    removeSubItem,
    subElements,
    localizeField,
    translationLanguagePriority,
    getLocalizationAttribute,
  } = useTemplateStore((s) => ({
    addSubItem: s.addSubItem,
    updateField: s.updateField,
    subMoveUp: s.subMoveUp,
    subMoveDown: s.subMoveDown,
    subDuplicateElement: s.subDuplicateElement,
    removeSubItem: s.removeSubItem,
    subElements: s.form.elements[elIndex].properties.subElements,
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
    getLocalizationAttribute: s.getLocalizationAttribute,
  }));

  const { addElement, isTextField } = useUpdateElement();

  const handleAddElement = useCallback(
    (subIndex: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, (data: FormElement) =>
          addSubItem(elIndex, subIndex, data.type, data)
        );
        return;
      }

      addSubItem(
        elIndex,
        subIndex,
        isTextField(type as string) && type !== FormElementTypes.textArea
          ? FormElementTypes.textField
          : type
      );
      // add 1 to index because it's a new element
      const path = `form.elements[${elIndex}].properties.subElements[${subIndex + 1}]`;
      addElement(type as string, path);
    },
    [addSubItem, elIndex, isTextField, addElement]
  );

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

  const onQuestionChange = (elIndex: number, subIndex: number, val: string, lang: Language) => {
    updateField(
      `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.${localizeField(
        LocalizedElementProperties.TITLE,
        lang
      )}`,
      val
    );
  };

  const onRequiredChange = (elIndex: number, subIndex: number, checked: boolean) => {
    updateField(
      `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.validation.required`,
      checked
    );
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
          position={-1}
          handleAdd={handleAddElement}
          filterElements={elementFilter}
        />
      </div>
    );

  return (
    <div {...props} className="mt-3 mb-3">
      {subElements.map((element, subIndex: number) => {
        const questionNumber = getQuestionNumber(element, subElements);
        const item = { ...element, index: subIndex, questionNumber };
        return (
          <div key={`sub-element-${item.id}-${subIndex}`}>
            <PanelHightLight
              conditionalChildren={
                <PanelActions
                  item={item}
                  subIndex={subIndex}
                  handleAdd={(subIndex: number, type?: FormElementTypes) => {
                    handleAddElement(subIndex, type);
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
                  renderMoreButton={({ item, moreButton }) => {
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
                  elements={subElements}
                />
              }
            >
              <PanelBodySub
                elIndex={elIndex}
                item={item}
                onQuestionChange={onQuestionChange}
                onRequiredChange={(subIndex, checked) => {
                  onRequiredChange(elIndex, subIndex, checked);
                }}
              />
            </PanelHightLight>
          </div>
        );
      })}

      {item.type === "dynamicRow" && (
        <div className="max-w-[800px] border-1 border-gray-300 h-auto mt-4 first-of-type:rounded-t-md last-of-type:rounded-b-md">
          <LockedBadge className="laptop:absolute laptop:right-7 laptop:top-[15px]" />
          <div className="mx-7 mt-5 mb-7">
            <h2 className="text-h3 pb-3">{t("questionSet.addAnother.title")}</h2>
            <p className="mb-8 text-[1rem] pt-5">{t("questionSet.addAnother.description")}</p>
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
