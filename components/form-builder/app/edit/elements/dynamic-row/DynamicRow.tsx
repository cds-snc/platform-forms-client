import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useTemplateStore } from "../../../../store";
import { PanelBodySub } from "../../PanelBodySub";
import { isValidatedTextType } from "../../../../util";
import { FormElementTypes } from "@lib/types";
import { AddElementButton } from "../element-dialog/AddElementButton";
import { LocalizedElementProperties, Language, ElementOptionsFilter } from "../../../../types";
import { DynamicRowModal } from "./DynamicRowModal";
import { PanelHightLight } from "./PanelHightlight";
import { PanelActions } from "../../PanelActions";

export const DynamicRow = ({ elIndex, ...props }: { elIndex: number }) => {
  const { t } = useTranslation("form-builder");

  const {
    addSubItem,
    resetSubChoices,
    unsetField,
    updateField,
    subMoveUp,
    subMoveDown,
    subDuplicateElement,
    removeSubItem,
    subElements,
    localizeField,
    lang,
  } = useTemplateStore((s) => ({
    lang: s.lang,
    addSubItem: s.addSubItem,
    updateField: s.updateField,
    subMoveUp: s.subMoveUp,
    subMoveDown: s.subMoveDown,
    subDuplicateElement: s.subDuplicateElement,
    unsetField: s.unsetField,
    removeSubItem: s.removeSubItem,
    subElements: s.form.elements[elIndex].properties.subElements,
    resetSubChoices: s.resetSubChoices,
    localizeField: s.localizeField,
  }));

  const handleAddElement = useCallback(
    (subIndex: number, type?: FormElementTypes) => {
      addSubItem(elIndex, subIndex, isValidatedTextType(type) ? FormElementTypes.textField : type);
      if (isValidatedTextType(type)) {
        // add 1 to index because it's a new element
        updateField(
          `form.elements[${elIndex}].properties.subElements[${
            subIndex + 1
          }].properties.validation.type`,
          type as string
        );
      }
    },
    [addSubItem, updateField, elIndex]
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

  const onElementChange = (id: string, elIndex: number, subIndex: number) => {
    switch (id) {
      case "text":
      case "textField":
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(
          `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.type`,
          "textField"
        );
        if (id === "textField" || id === "text") {
          unsetField(
            `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.validation.type`
          );
        } else {
          updateField(
            `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.validation.type`,
            id
          );
          unsetField(
            `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.validation.maxLength`
          );
        }
        break;
      case "richText":
        resetSubChoices(elIndex, subIndex);
      // no break here (we want default to happen)
      default: // eslint-disable-line no-fallthrough
        updateField(`form.elements[${elIndex}].properties.subElements[${subIndex}].type`, id);
        unsetField(
          `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.validation.type`
        );
        unsetField(
          `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.validation.maxLength`
        );
        break;
    }

    _setDefaultDescription(id, elIndex, subIndex);
  };

  const _setDefaultDescription = (id: string, elIndex: number, subIndex: number) => {
    switch (id) {
      case "email":
      case "phone":
      case "date":
      case "number":
        // update default description en
        updateField(
          `form.elements[${elIndex}].properties.subElements[${subIndex}].properties[${localizeField(
            LocalizedElementProperties.DESCRIPTION,
            "en"
          )}]`,
          t(`defaultElementDescription.${id}`, { lng: "en" })
        );
        // update default description fr
        updateField(
          `form.elements[${elIndex}].properties.subElements[${subIndex}].properties[${localizeField(
            LocalizedElementProperties.DESCRIPTION,
            "fr"
          )}]`,
          t(`defaultElementDescription.${id}`, { lng: "fr" })
        );
        break;
      default:
        break;
    }
  };

  const onRequiredChange = (elIndex: number, subIndex: number, checked: boolean) => {
    updateField(
      `form.elements[${elIndex}].properties.subElements[${subIndex}].properties.validation.required`,
      checked
    );
  };

  const elementFilter: ElementOptionsFilter = (elements) => {
    return elements.filter((element) => element.id !== "dynamicRow");
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
        const item = { ...element, index: subIndex };
        return (
          <PanelHightLight
            key={`sub-element-${item.id}-${subIndex}`}
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
                    <DynamicRowModal
                      elIndex={elIndex}
                      subIndex={subIndex}
                      item={{ ...item, index: item.id }}
                      moreButton={moreButton}
                    />
                  );
                }}
                filterElements={elementFilter}
                elements={subElements}
                lang={lang}
              />
            }
          >
            <PanelBodySub
              elements={subElements}
              elIndex={elIndex}
              item={item}
              onQuestionChange={onQuestionChange}
              onElementChange={(id, subIndex) => {
                onElementChange(id, elIndex, subIndex);
              }}
              onRequiredChange={(subIndex, checked) => {
                onRequiredChange(elIndex, subIndex, checked);
              }}
            />
          </PanelHightLight>
        );
      })}
    </div>
  );
};
