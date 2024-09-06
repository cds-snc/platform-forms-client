"use client";
import React from "react";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { PanelBodySub } from "../../PanelBodySub";
import { FormElementTypes } from "@lib/types";
import { AddToSetButton } from "../AddToSetButton";
import {
  LocalizedElementProperties,
  Language,
  ElementOptionsFilter,
} from "@lib/types/form-builder-types";
import { SubElementModal } from "./SubElementModal";
import { PanelHightLight } from "./PanelHightlight";
import { PanelActions } from "../../PanelActions";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";

export const SubElement = ({ elIndex, formId, ...props }: { elIndex: number; formId: string }) => {
  const {
    updateField,
    subMoveUp,
    subMoveDown,
    subDuplicateElement,
    removeSubItem,
    subElements,
    propertyPath,
  } = useTemplateStore((s) => ({
    updateField: s.updateField,
    subMoveUp: s.subMoveUp,
    subMoveDown: s.subMoveDown,
    subDuplicateElement: s.subDuplicateElement,
    removeSubItem: s.removeSubItem,
    subElements: s.form.elements[elIndex].properties.subElements,
    getLocalizationAttribute: s.getLocalizationAttribute,
    propertyPath: s.propertyPath,
  }));

  const { handleAddSubElement } = useHandleAdd();

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
      <div className="ml-4 mt-10">
        <AddToSetButton
          handleAdd={(type?: FormElementTypes) => {
            handleAddSubElement(elIndex, 0, type);
          }}
          filterElements={elementFilter}
        />
      </div>
    );

  return (
    <div {...props}>
      {subElements.map((element, subIndex: number) => {
        const item = { ...element, index: subIndex };
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
              <div className="pt-4">
                <PanelBodySub
                  elIndex={elIndex}
                  item={item}
                  onQuestionChange={onQuestionChange}
                  onRequiredChange={onRequiredChange}
                  formId={formId}
                />
              </div>
            </PanelHightLight>
          </div>
        );
      })}

      {subElements.length >= 1 && (
        <div className="m-4">
          <AddToSetButton
            handleAdd={(type?: FormElementTypes) => {
              handleAddSubElement(elIndex, subElements.length, type);
            }}
            filterElements={elementFilter}
          />
        </div>
      )}
    </div>
  );
};
