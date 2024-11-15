"use client";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import React, { useCallback, useEffect } from "react";
import { Rules } from "./Rules";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { useRouter } from "next/navigation";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Button } from "@clientComponents/globals/Buttons/Button";
import {
  ChoiceRule,
  choiceRulesToConditonalRules,
  cleanChoiceIdsFromRules,
} from "@lib/formContext";
import { getPathString } from "@lib/utils/form-builder/getPath";

type RulesDialogEventDetails = {
  mode: "add" | "edit";
  itemId: number;
  optionId: string;
};

export const RulesDialog = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { t, i18n } = useTranslation("form-builder");
  const { Event } = useCustomEvent();
  const dialog = useDialogRef();
  const { togglePanel } = useTreeRef();
  const router = useRouter();

  const [mode, setMode] = React.useState<"add" | "edit">("add");
  const [item, setItem] = React.useState<FormElementWithIndex | undefined>(undefined);
  const [optionId, setOptionId] = React.useState<string | null>(null);

  const choiceRulesRef = React.useRef<ChoiceRule[]>([]);

  const { getFormElementWithIndexById, elements, formId, updateField } = useTemplateStore((s) => ({
    getFormElementWithIndexById: s.getFormElementWithIndexById,
    elements: s.form.elements,
    formId: s.id,
    updateField: s.updateField,
  }));

  // @TODO: check?
  // if (storeId && storeId !== formId) {
  //   formId = storeId;
  // }

  // const isRichText = item?.type == "richText"; // @TODO: check?
  const descriptionId = `descriptionId-${Date.now()}`;

  const handleOpenDialog = useCallback(
    (detail: RulesDialogEventDetails) => {
      if (detail) {
        const freshItem = getFormElementWithIndexById(detail.itemId);
        setItem(freshItem);
        setMode(detail.mode);
        setOptionId(detail.optionId);
        setIsOpen(true);
      }
    },
    [getFormElementWithIndexById]
  );

  const handleSubmit = ({ item }: { item: FormElementWithIndex }) => {
    // return (e: React.MouseEvent<HTMLElement>) => {
    // Handle the case where there are no rules
    if (!choiceRulesRef.current || !choiceRulesRef.current.length) {
      elements.forEach((el) => {
        if (!el.properties.conditionalRules) return;
        const rules = cleanChoiceIdsFromRules(String(item.id), el.properties.conditionalRules);

        // Just return if updated rules match existing rules
        if (JSON.stringify(rules) === JSON.stringify(el.properties.conditionalRules)) return;

        // Update the element rules if they have changed
        const properties = { ...el.properties, conditionalRules: rules };
        updateField(getPathString(el.id, elements), properties);
      });
      setIsOpen(false);
      return;
    }

    const els = choiceRulesToConditonalRules(elements, choiceRulesRef.current);
    // Update the element rules
    Object.entries(els).forEach(([key, value]) => {
      const element = elements.find((el) => el.id == Number(key));
      if (!element) return;
      const properties = { ...element.properties, conditionalRules: value };
      updateField(getPathString(Number(key), elements), properties);
    });
    setIsOpen(false);
  };

  useEffect(() => {
    Event.on("open-rules-dialog", handleOpenDialog);

    return () => {
      Event.off("open-rules-dialog", handleOpenDialog);
    };
  });

  const handleClose = () => {
    dialog.current?.close();
    setIsOpen(false);
  };

  const handletryLogicView = () => {
    // Toggle the panel open as it may be closed.
    togglePanel && togglePanel(true);
    router.push(`/${i18n.language}/form-builder/${formId}/edit/logic`);
  };

  return (
    <>
      {isOpen && item && (
        <Dialog
          dialogRef={dialog}
          actions={
            <>
              <Button
                data-testid="more-modal-save-button"
                className="mr-4"
                onClick={() => handleSubmit({ item })}
              >
                {t("save")}
              </Button>
            </>
          }
          handleClose={handleClose}
          title={
            mode === "edit"
              ? t("addConditionalRules.modalTitleEdit")
              : t("addConditionalRules.modalTitle")
          }
        >
          <div className="p-5">
            This is the {mode} rules dialog for item {item?.id}
            <p className="mb-4" id={descriptionId}>
              {t("addConditionalRules.modalDescription")}
            </p>
            <p className="mb-4">
              <strong>{t("addConditionalRules.warning")}</strong>
            </p>
            <Rules
              mode={mode}
              optionId={optionId}
              item={item}
              setItem={setItem}
              descriptionId={descriptionId}
              tryLogicView={handletryLogicView}
              choiceRulesRef={choiceRulesRef}
            />
          </div>
        </Dialog>
      )}
    </>
  );
};
