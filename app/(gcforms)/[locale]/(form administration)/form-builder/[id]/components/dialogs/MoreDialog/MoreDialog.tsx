"use client";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { Dialog, useDialogRef } from "@formBuilder/components/shared/Dialog";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";
import { Question } from "./Question";
import { Description } from "./Description";
import { AddressCompleteOptions } from "./AddressCompleteOptions";
import { FormattedDateOptions } from "./FormattedDateOptions";
import { RequiredOptions } from "./RequiredOptions";
import { StrictValue } from "./StrictValue";
import { SortOptions } from "./SortOptions";
import { DynamicRowOptions } from "./DynamicRowOptions";
import { TextFieldOptions } from "./TextFieldOptions";
import { CharacterLimitOptions } from "./CharacterLimitOptions";
import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";
import { FormElement } from "@lib/types";
import { QuestionTagOptions } from "./QuestionTagOptions";
import { QuestionIdOptions } from "./QuestionIdOptions";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";

export const MoreDialog = () => {
  const { getPathString, updateField, setChangeKey, getFormElementById } = useTemplateStore(
    (s) => ({
      lang: s.lang,
      updateField: s.updateField,
      getFocusInput: s.getFocusInput,
      setChangeKey: s.setChangeKey,
      getFormElementById: s.getFormElementById,
      getPathString: s.getPathString,
    })
  );

  const [item, setItem] = React.useState<FormElement | undefined>(undefined);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isValid, setIsValid] = React.useState(true);
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
        disabled={!isValid}
        onClick={() => {
          updateField(getPathString(item.id), item.properties);
          setChangeKey(String(new Date().getTime()));
          handleClose();
        }}
      >
        {t("save")}
      </Button>
    </>
  );
  const dialogTitle = t("moreOptions");

  return (
    <>
      {isOpen && (
        <Dialog dialogRef={dialog} actions={actions} handleClose={handleClose} title={dialogTitle}>
          <div className="p-5">
            <form
              onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                updateField(getPathString(item.id), item.properties);
                setChangeKey(String(new Date().getTime()));
                handleClose();
                e.preventDefault();
              }}
            >
              <section>
                <Question item={item} setItem={setItem} />
                <Description item={item} setItem={setItem} />
              </section>

              <AddressCompleteOptions item={item} setItem={setItem} />

              <FormattedDateOptions item={item} setItem={setItem} />

              <RequiredOptions item={item} setItem={setItem} />

              <StrictValue item={item} setItem={setItem} />

              <DynamicRowOptions item={item} setItem={setItem} />

              <TextFieldOptions item={item} setItem={setItem} />

              <CharacterLimitOptions item={item} setItem={setItem} />

              <SortOptions item={item} setItem={setItem} />

              {item.type !== "dynamicRow" && (
                <InfoDetails summary={t("moreDialog.apiOptionsSection.title")}>
                  <p className="mt-6">{t("moreDialog.apiOptionsSection.description")}</p>
                  <QuestionIdOptions setIsValid={setIsValid} item={item} setItem={setItem} />
                  <QuestionTagOptions item={item} setItem={setItem} />
                </InfoDetails>
              )}
              <input type="submit" className="hidden" />
            </form>
          </div>
        </Dialog>
      )}
    </>
  );
};
