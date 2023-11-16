import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";

import { Modal, ModalButton, ModalFormRules } from "./index";
import { FormElementWithIndex } from "../../types";
import { useTemplateStore, useModalRulesStore } from "../../store";
import { Button } from "@components/globals";
import { useRefsContext } from "@formbuilder/app/edit/RefsContext";
import { getPathString } from "@formbuilder/getPath";
import { ChoiceRule } from "@lib/formContext";

export const ModalRules = ({ item }: { item: FormElementWithIndex }) => {
  const { elements, updateField } = useTemplateStore((s) => ({
    updateField: s.updateField,
    elements: s.form.elements,
  }));

  const { refs } = useRefsContext();
  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const { modals, updateModalProperties } = useModalRulesStore();

  useEffect(() => {
    if (item.type != "richText") {
      if (!modals[item.id]) {
        updateModalProperties(item.id, { conditionalRules: [] });
      }
    }
  }, [item, modals, updateModalProperties]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSubmit = ({ properties }: { properties: any }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      properties.conditionalRules.forEach((rule: ChoiceRule) => {
        const element = elements.find((el) => el.id == Number(rule.questionId));
        if (element) {
          const properties = { ...element.properties };

          let choiceId = rule.choiceId;
          if (choiceId === "1") {
            choiceId = "1.0";
          }

          properties.conditionalRules = { whenId: choiceId };
          updateField(getPathString(Number(rule.questionId), elements), properties);
        }
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
            onClick={handleSubmit({ properties: modals[item.id] })}
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
          {t("addConditionalRules.addCustomRules")}
        </Button>
      }
      saveButton={renderSaveButton()}
      handleClose={() => {
        refs && refs.current && refs.current[item.id] && refs.current[item.id].focus();
      }}
    >
      {!isRichText && modals[item.id] && (
        <>
          <p className="mb-4">{t("addConditionalRules.modalDescription")}</p>
          <ModalFormRules
            item={item}
            properties={modals[item.id]}
            updateModalProperties={updateModalProperties}
          />
        </>
      )}
    </Modal>
  );
};
