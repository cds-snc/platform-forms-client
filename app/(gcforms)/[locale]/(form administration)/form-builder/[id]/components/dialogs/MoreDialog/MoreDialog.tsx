"use client";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { getPathString } from "@lib/utils/form-builder/getPath";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { Question } from "./Question";
import { Description } from "./Description";
import { AddressCompleteOptions } from "./AddressCompleteOptions";
import { FormattedDateOptions } from "./FormattedDateOptions";
import { RequiredOptions } from "./RequiredOptions";
import { DynamicRowOptions } from "./DynamicRowOptions";
import { TextFieldOptions } from "./TextFieldOptions";
import { CharacterLimitOptions } from "./CharacterLimitOptions";
import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";
import { FormElement } from "@lib/types";

export const MoreDialog = () => {
  const { elements, updateField, setChangeKey, getFormElementById } = useTemplateStore((s) => ({
    lang: s.lang,
    updateField: s.updateField,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
    setChangeKey: s.setChangeKey,
    getFormElementById: s.getFormElementById,
  }));

  const [item, setItem] = React.useState<FormElement | undefined>(undefined);
  const [isOpen, setIsOpen] = React.useState(false);
  const { Event } = useCustomEvent();
  const dialog = useDialogRef();
  const { refs } = useRefsContext();
  const { t } = useTranslation("form-builder");

  type MoreDialogEventDetails = {
    itemId: number;
  };

  const handleOpenDialog = useCallback(
    (detail: MoreDialogEventDetails) => {
      if (detail) {
        const freshItem = getFormElementById(detail.itemId);
        setItem(freshItem);
        setIsOpen(true);
      }
    },
    [getFormElementById]
  );

  useEffect(() => {
    Event.on("open-more-dialog", handleOpenDialog);

    return () => {
      Event.off("open-more-dialog", handleOpenDialog);
    };
  });

  if (!item) return null;

  const handleClose = () => {
    dialog.current?.close();
    refs && refs.current && refs.current[item.id] && refs.current[item.id].focus();
    setIsOpen(false);
  };

  const actions = (
    <>
      <Button
        theme="secondary"
        onClick={() => {
          dialog.current?.close();
          handleClose && handleClose();
        }}
      >
        {t("cancel")}
      </Button>
      <Button
        data-testid="more-modal-save-button"
        className="ml-5"
        theme="primary"
        onClick={() => {
          updateField(getPathString(item.id, elements), item.properties);
          setChangeKey(String(new Date().getTime()));
          handleClose();
        }}
      >
        {t("save")}
      </Button>
    </>
  );

  return (
    <>
      {isOpen && (
        <Dialog
          dialogRef={dialog}
          actions={actions}
          handleClose={handleClose}
          title={t("moreOptions")}
        >
          <div className="p-5">
            <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}>
              <section>
                <Question item={item} setItem={setItem} />
                <Description item={item} setItem={setItem} />
              </section>

              <AddressCompleteOptions item={item} setItem={setItem} />

              <FormattedDateOptions item={item} setItem={setItem} />

              <RequiredOptions item={item} setItem={setItem} />

              <DynamicRowOptions item={item} setItem={setItem} />

              <TextFieldOptions item={item} setItem={setItem} />

              <CharacterLimitOptions item={item} setItem={setItem} />
            </form>
          </div>
        </Dialog>
      )}
    </>
  );
};
