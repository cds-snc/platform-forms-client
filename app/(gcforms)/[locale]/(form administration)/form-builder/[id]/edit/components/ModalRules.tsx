"use client";
import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { useRouter } from "next/navigation";

import { Modal, ModalButton, ModalFormRules } from "./index";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Button } from "@clientComponents/globals";
import { getPathString } from "@lib/utils/form-builder/getPath";
import {
  ChoiceRule,
  choiceRulesToConditonalRules,
  getElementsWithRuleForChoice,
  cleanChoiceIdsFromRules,
} from "@lib/formContext";
import { useRefsContext } from "./RefsContext";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import useModalRulesStore from "@lib/store/useModalRulesStore";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

export const ModalRules = ({
  item,
  modalRef,
  formId,
  focusedOption,
  mode,
}: {
  item: FormElementWithIndex;
  modalRef?: React.RefObject<HTMLDivElement> | undefined;
  formId: string;
  focusedOption: string | null;
  mode: "add" | "edit";
}) => {
  const {
    elements,
    updateField,
    formId: storeId,
  } = useTemplateStore((s) => ({
    updateField: s.updateField,
    elements: s.form.elements,
    formId: s.id,
  }));

  if (storeId && storeId !== formId) {
    formId = storeId;
  }

  const router = useRouter();
  const { togglePanel } = useTreeRef();

  const { refs } = useRefsContext();
  const { t, i18n } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const { modals, updateModalProperties } = useModalRulesStore();
  const descriptionId = `descriptionId-${Date.now()}`;

  const initialChoiceRules = getElementsWithRuleForChoice({
    formElements: elements,
    itemId: item.id,
  });

  // Add a new rule for the focused option
  if (mode === "add" && focusedOption) {
    initialChoiceRules.push({ elementId: String(item.id), choiceId: focusedOption });
  }

  const hasRules = (initialChoiceRules && initialChoiceRules?.length > 0) ?? false;

  useEffect(() => {
    if (item.type != "richText") {
      if (!modals[item.id]) {
        updateModalProperties(item.id, { conditionalRules: initialChoiceRules });
      }
    }
  }, [item, modals, updateModalProperties, initialChoiceRules]);

  const handleSubmit = ({
    conditionalRules,
    itemId,
  }: {
    conditionalRules: ChoiceRule[];
    itemId: number;
  }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      // Handle the case where there are no rules
      if (!conditionalRules || !conditionalRules.length) {
        elements.forEach((el) => {
          if (!el.properties.conditionalRules) return;
          const rules = cleanChoiceIdsFromRules(String(itemId), el.properties.conditionalRules);

          // Just return if updated rules match existing rules
          if (JSON.stringify(rules) === JSON.stringify(el.properties.conditionalRules)) return;

          // Update the element rules if they have changed
          const properties = { ...el.properties, conditionalRules: rules };
          updateField(getPathString(el.id, elements), properties);
        });
        return;
      }

      const els = choiceRulesToConditonalRules(elements, conditionalRules);
      // Update the element rules
      Object.entries(els).forEach(([key, value]) => {
        const element = elements.find((el) => el.id == Number(key));
        if (!element) return;
        const properties = { ...element.properties, conditionalRules: value };
        updateField(getPathString(Number(key), elements), properties);
      });
    };
  };

  const renderSaveButton = () => {
    return (
      <ModalButton isOpenButton={false}>
        {modals[item.id] && (
          <Button
            data-testid="more-modal-save-button"
            className="mr-4"
            onClick={handleSubmit({
              conditionalRules: modals[item.id].conditionalRules,
              itemId: item.id,
            })}
          >
            {t("save")}
          </Button>
        )}
      </ModalButton>
    );
  };

  const handletryLogicView = () => {
    // Toggle the panel open as it may be closed.
    togglePanel && togglePanel(true);
    router.push(`/${i18n.language}/form-builder/${formId}/edit/logic`);
  };

  return (
    <Modal
      modalRef={modalRef}
      title={
        hasRules ? t("addConditionalRules.modalTitleEdit") : t("addConditionalRules.modalTitle")
      }
      noOpenButton={true}
      saveButton={renderSaveButton()}
      handleClose={() => {
        refs && refs.current && refs.current[item.id] && refs.current[item.id].focus();
      }}
    >
      {!isRichText && modals[item.id] && (
        <>
          <p className="mb-4" id={descriptionId}>
            {t("addConditionalRules.modalDescription")}
          </p>
          <p className="mb-4">
            <strong>{t("addConditionalRules.warning")}</strong>
          </p>
          <ModalFormRules
            initialChoiceRules={initialChoiceRules}
            item={item}
            properties={modals[item.id]}
            updateModalProperties={updateModalProperties}
            descriptionId={descriptionId}
            tryLogicView={handletryLogicView}
          />
        </>
      )}
    </Modal>
  );
};
