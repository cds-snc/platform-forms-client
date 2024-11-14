"use client";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useTranslation } from "@i18n/client";
import { ChoiceRule, getElementsWithRuleForChoice } from "@lib/formContext";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import React, { useEffect } from "react";
import { Rules } from "./Rules";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { useRouter } from "next/navigation";
import { FormElementWithIndex } from "@lib/types/form-builder-types";

type RulesDialogEventDetails = {
  mode: "add" | "edit";
  itemId: number;
  optionId: string;
  // need formId?
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
  const [initialChoiceRules, setInitialChoiceRules] = React.useState<ChoiceRule[]>([]);

  const { getFormElementWithIndexById, elements, formId } = useTemplateStore((s) => ({
    getFormElementWithIndexById: s.getFormElementWithIndexById,
    elements: s.form.elements,
    formId: s.id,
  }));

  // @TODO: check?
  // if (storeId && storeId !== formId) {
  //   formId = storeId;
  // }

  // @TODO:
  const hasRules = (initialChoiceRules && initialChoiceRules?.length > 0) ?? false;
  // const isRichText = item?.type == "richText"; // @TODO: check?
  const descriptionId = `descriptionId-${Date.now()}`; // TODO

  const handleOpenDialog = (detail: RulesDialogEventDetails) => {
    const freshItem = getFormElementWithIndexById(detail.itemId);
    setItem(freshItem);

    const initialChoiceRules = getElementsWithRuleForChoice({
      formElements: elements,
      itemId: detail.itemId,
    });

    setInitialChoiceRules(initialChoiceRules);

    setMode(detail.mode);

    // Add a new rule for the focused option
    if (mode === "add") {
      initialChoiceRules.push({ elementId: String(item?.id), choiceId: detail.optionId });
    }

    setIsOpen(true);
  };

  // @TODO:
  // useEffect(() => {
  //   if (item.type != "richText") {
  //     if (!modals[item.id]) {
  //       updateModalProperties(item.id, { conditionalRules: initialChoiceRules });
  //     }
  //   }
  // }, [item, modals, updateModalProperties, initialChoiceRules]);

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
          // actions={actions}
          handleClose={handleClose}
          title={
            hasRules ? t("addConditionalRules.modalTitleEdit") : t("addConditionalRules.modalTitle")
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
              initialChoiceRules={initialChoiceRules}
              item={item}
              setItem={setItem}
              descriptionId={descriptionId}
              tryLogicView={handletryLogicView}
            />
          </div>
        </Dialog>
      )}
    </>
  );
};
