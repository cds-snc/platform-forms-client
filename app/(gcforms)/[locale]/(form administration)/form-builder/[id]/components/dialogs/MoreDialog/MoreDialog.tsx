"use client";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Button } from "@clientComponents/globals";
import { getPathString } from "@lib/utils/form-builder/getPath";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { Question } from "./Question";
import { Description } from "./Description";
import { AddressCompleteOptions } from "./AddressCompleteOptions";
import { FormattedDateOptions } from "./FormattedDateOptions";
import { AddRules } from "./AddRules";
import { DynamicRowOptions } from "./DynamicRowOptions";
import { TextFieldOptions } from "./TextFieldOptions";
import { CharacterLimitOptions } from "./CharacterLimitOptions";
import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";

export const MoreDialog = () => {
  const { elements, updateField, setChangeKey } = useTemplateStore((s) => ({
    lang: s.lang,
    updateField: s.updateField,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
    setChangeKey: s.setChangeKey,
  }));

  const [item, setItem] = React.useState<FormElementWithIndex | null>(null);
  const [isOpen, setIsOpen] = React.useState(false);
  const { Event } = useCustomEvent();
  const dialog = useDialogRef();
  const { refs } = useRefsContext();
  const { t } = useTranslation("form-builder");

  type MoreDialogEventDetails = {
    item: FormElementWithIndex;
  };

  const handleOpenDialog = useCallback((detail: MoreDialogEventDetails) => {
    if (detail) {
      setItem(detail.item);
      setIsOpen(true);
    }
  }, []);

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

              <AddRules item={item} setItem={setItem} />

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
