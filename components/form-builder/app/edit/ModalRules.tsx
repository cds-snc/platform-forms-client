import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";

import { Modal, ModalButton, ModalFormRules } from "./index";
import { FormElementWithIndex } from "../../types";
import { useTemplateStore, useModalRulesStore } from "../../store";
import { Button } from "@components/globals";
import { useRefsContext } from "@formbuilder/app/edit/RefsContext";
import { getPathString } from "@formbuilder/getPath";
import {
  ChoiceRule,
  choiceRulesToConditonalRules,
  getElementsWithRuleForChoice,
  cleanChoiceIdsFromRules,
} from "@lib/formContext";

export const ModalRules = ({ item }: { item: FormElementWithIndex }) => {
  const { elements, updateField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    elements: s.form.elements,
  }));

  const { refs } = useRefsContext();
  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const { modals, updateModalProperties } = useModalRulesStore();
  const descriptionId = `descriptionId-${Date.now()}`;

  const initialChoiceRules = getElementsWithRuleForChoice({
    formElements: elements,
    itemId: item.id,
  });

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

  return (
    <Modal
      title={t("addConditionalRules.modalTitle")}
      openButton={
        <Button className="!m-0 !mt-4" theme="link">
          {hasRules
            ? t("addConditionalRules.editCustomRules")
            : t("addConditionalRules.addCustomRules")}
        </Button>
      }
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
          <ModalFormRules
            initialChoiceRules={initialChoiceRules}
            item={item}
            properties={modals[item.id]}
            updateModalProperties={updateModalProperties}
            descriptionId={descriptionId}
          />
        </>
      )}
    </Modal>
  );
};
