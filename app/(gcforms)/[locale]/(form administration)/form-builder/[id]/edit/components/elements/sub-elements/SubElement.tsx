"use client";
import React from "react";

import { useTemplateStore } from "@lib/store/useTemplateStore";
import { PanelBodySub } from "../../PanelBodySub";
import { FormElementTypes } from "@lib/types";
import {
  LocalizedElementProperties,
  Language,
  ElementOptionsFilter,
} from "@lib/types/form-builder-types";
import { PanelHightLight } from "./PanelHightlight";
import { PanelActions } from "../../PanelActions";
import { useHandleAdd } from "@lib/hooks/form-builder/useHandleAdd";
import { CustomizeSetButton } from "../CustomizeSetButton";
import { AddToSetButton } from "../AddToSetButton";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { useRefsContext } from "../../RefsContext";
import { useFormBuilderConfig } from "@lib/hooks/useFormBuilderConfig";
import { cn } from "@lib/utils";

export const SubElement = ({
  item,
  elIndex,
  formId,
  ...props
}: {
  item: FormElementWithIndex;
  elIndex: number;
  formId: string;
}) => {
  const { updateField, subMoveUp, subMoveDown, removeSubItem, propertyPath, setChangeKey } =
    useTemplateStore((s) => ({
      updateField: s.updateField,
      subMoveUp: s.subMoveUp,
      subMoveDown: s.subMoveDown,
      removeSubItem: s.removeSubItem,
      getLocalizationAttribute: s.getLocalizationAttribute,
      propertyPath: s.propertyPath,
      setChangeKey: s.setChangeKey,
    }));

  const { refs } = useRefsContext();

  const subElements = item.properties.subElements;

  const { hasApiKeyId } = useFormBuilderConfig();

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

  const focusSubElement = (id: number) => {
    // Add delay to wait for the new element to be rendered
    setTimeout(() => {
      try {
        // @todo --- this currently isn't working for rich text elements
        refs && refs.current && refs.current[id]?.focus();
      } catch (e) {
        // no-op
      }
    }, 200);
  };

  const forceRefresh = (id?: number) => {
    setChangeKey(String(new Date().getTime())); //Force a re-render
    id && focusSubElement(id);
  };

  if (!subElements || subElements.length < 1)
    return (
      <div className="ml-4 mt-10" data-id={item.id}>
        <AddToSetButton
          handleAdd={async (type?: FormElementTypes) => {
            const id = await handleAddSubElement(item.id, 0, type);
            forceRefresh(id);
          }}
          filterElements={elementFilter}
        />
        <CustomizeSetButton item={item} />
      </div>
    );

  return (
    <div {...props}>
      {subElements.map((element, subIndex: number) => {
        const item = { ...element, index: subIndex };
        return (
          <div key={`sub-element-${item.id}-${subIndex}`}>
            <PanelHightLight
              id={item.id}
              conditionalChildren={
                <PanelActions
                  item={item}
                  isSubPanel={true}
                  isFirstItem={subIndex === 0}
                  isLastItem={subIndex === subElements.length - 1}
                  totalItems={subElements.length}
                  handleAdd={async (type?: FormElementTypes) => {
                    const id = await handleAddSubElement(item.id, subIndex, type);
                    forceRefresh(id);
                  }}
                  handleRemove={() => {
                    removeSubItem(item.id, item.id);
                    forceRefresh();
                  }}
                  handleDuplicate={() => {}} // no duplicate for sub elements
                  handleMoveUp={() => {
                    subMoveUp(item.id, subIndex);
                    forceRefresh(item.id);
                  }}
                  handleMoveDown={() => {
                    subMoveDown(item.id, subIndex);
                    forceRefresh(item.id);
                  }}
                  filterElements={elementFilter}
                />
              }
            >
              <div
                className={cn(
                  "pt-4",
                  !hasApiKeyId &&
                    item.type === FormElementTypes.fileInput &&
                    "bg-red-50 hover:bg-red-50 focus-within:bg-red-50 px-4 py-2"
                )}
              >
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
        <div className="mb-2 ml-4 mt-4" data-id={item.id}>
          <AddToSetButton
            handleAdd={async (type?: FormElementTypes) => {
              const id = await handleAddSubElement(item.id, subElements.length, type);
              forceRefresh(id);
            }}
            filterElements={elementFilter}
          />
          <CustomizeSetButton item={item} />
        </div>
      )}
    </div>
  );
};
