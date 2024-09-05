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
import { getQuestionNumber } from "@lib/utils/form-builder";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";
import { cn } from "@lib/utils";

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
      <div className="mt-10">
        <AddToSetButton
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
    <div {...props} className="">
      {subElements.map((element, subIndex: number) => {
        const questionNumber = getQuestionNumber(element, subElementTypes, true);
        const item = { ...element, index: subIndex, questionNumber };
        return (
          <div
            className={cn("mb-5", subIndex === 0 ? "mt-5" : "")}
            key={`sub-element-${item.id}-${subIndex}`}
          >
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
                formId={formId}
              />
            </PanelHightLight>
          </div>
        );
      })}

      {subElements.length >= 1 && (
        <div>
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
