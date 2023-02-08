import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { useTemplateStore } from "../../../store";
import { PanelBodySub } from "../PanelBodySub";
import { isValidatedTextType } from "../../../util";
import { FormElementTypes } from "@lib/types";
import { AddElementButton } from "../elements/element-dialog/AddElementButton";
import { Button } from "../../shared/Button";
import { LocalizedElementProperties, Language, ElementOptionsFilter } from "../../../types";
import { DynamicRowModal } from "./DynamicRowModal";

export const DynamicRow = ({ elIndex, ...props }: { elIndex: number }) => {
  const { t } = useTranslation("form-builder");

  const {
    addSubItem,
    resetSubChoices,
    unsetField,
    updateField,
    removeSubItem,
    subElements,
    localizeField,
  } = useTemplateStore((s) => ({
    lang: s.lang,
    addSubItem: s.addSubItem,
    updateField: s.updateField,
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
          `form.elements[${elIndex}].subElements[${subIndex}].properties[${localizeField(
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
          <div key={`sub-element-${item.id}-${subIndex}`}>
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
            <div className="mt-5">
              <AddElementButton
                position={subIndex}
                handleAdd={handleAddElement}
                filterElements={elementFilter}
              />
              <Button
                theme="secondary"
                className="btn btn-danger inline-block ml-5 !border-1.5 !py-2 !px-4 leading-6 text-sm"
                onClick={() => removeSubItem(elIndex, item.id)}
              >
                {t("remove")}
              </Button>
              {/* 
                
                Note: we modify the item index for the modal / state 
                The "actual" item index remains untouched
  
                By doing this to avoid conflicting indexes with the top level element
                */}
              <DynamicRowModal
                elIndex={elIndex}
                subIndex={subIndex}
                item={{ ...item, index: item.id }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
