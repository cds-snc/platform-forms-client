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
import { DynamicRowDialog } from "@formBuilder/components/shared/DynamicRowDialog";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { MoreIcon } from "@serverComponents/icons/MoreIcon";

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

  const { t } = useTranslation("form-builder");

  const [showCustomizeSetDialog, setShowCustomizeSetDialog] = React.useState(false);

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
        <div className="mb-2 ml-4 mt-4">
          <AddToSetButton
            handleAdd={(type?: FormElementTypes) => {
              handleAddSubElement(elIndex, subElements.length, type);
            }}
            filterElements={elementFilter}
          />
        </div>
      )}

      <div className="mb-4 ml-4">
        <Button
          onClick={() => {
            setShowCustomizeSetDialog(true);
          }}
          theme="link"
          className="group/button mb-2 !px-4 !py-2 text-sm leading-6"
          dataTestId="add-element"
        >
          <>
            <MoreIcon className="mr-2 size-[24px] rounded-sm border-1 border-black group-focus/button:border-white group-focus/button:fill-white" />
            {t("dynamicRow.dialog.customizeElement")}
          </>
        </Button>
      </div>
      {showCustomizeSetDialog && (
        <DynamicRowDialog
          handleClose={() => setShowCustomizeSetDialog(false)}
          handleConfirm={() => {}}
        />
      )}
    </div>
  );
};
