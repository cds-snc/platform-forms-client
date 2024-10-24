"use client";
import React, { useCallback, useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Button } from "@clientComponents/globals";
// import { Modal } from "./index";
// import { ModalButton, ModalForm } from "./index";
import { getPathString } from "@lib/utils/form-builder/getPath";
import { useTemplateStore } from "@lib/store/useTemplateStore";
// import { useRefsContext } from "@formBuilder/[id]/edit/components/RefsContext";
import { ModalForm } from "./ModalForm";
import { Dialog, useDialogRef } from "@formBuilder/components/shared";
import { useCustomEvent } from "@lib/hooks/useCustomEvent";

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

  // const { refs } = useRefsContext();
  const { t } = useTranslation("form-builder");

  if (!item) return null;

  //   const { isOpen, modals, updateModalProperties, unsetModalField } = useModalStore();

  //   useEffect(() => {
  //     if (item.type != "richText") {
  //       const indexes = getElementIndexes(item.id, elements);
  //       if (!indexes || indexes[0] === null || indexes[0] === undefined) return;
  //     //   updateModalProperties(item.id, elements[indexes[0]].properties);
  //     }
  //   }, [item, isOpen, isRichText, elements, updateModalProperties]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  // const handleSubmit = ({ item, properties }: { item: FormElementWithIndex; properties: any }) => {
  //   return (e: React.MouseEvent<HTMLElement>) => {
  //     e.preventDefault();
  //     // replace all of "properties" with the new properties set in the ModalForm
  //     updateField(getPathString(item.id, elements), properties);
  //     onClose(); // Let the PanelBody know that the modal is closed so it can refresh.
  //   };
  // };

  const handleClose = () => {
    dialog.current?.close();
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

  //   const renderSaveButton = () => {
  //     return (
  //       <ModalButton isOpenButton={false}>
  //         {modals[item.id] && (
  //           <Button
  //             data-testid="more-modal-save-button"
  //             className="mr-4"
  //             onClick={handleSubmit({ item, properties: modals[item.id] })}
  //           >
  //             {t("save")}
  //           </Button>
  //         )}
  //       </ModalButton>
  //     );
  //   };

  // <Modal
  //   title={t("moreOptions")}
  //   openButton={moreButton}
  //   saveButton={renderSaveButton()}
  //   handleClose={() => {
  //     refs && refs.current && refs.current[item.id] && refs.current[item.id].focus();
  //   }}
  // >
  // </Modal>

  return (
    <>
      {isOpen && (
        <Dialog dialogRef={dialog} actions={actions} handleClose={handleClose}>
          <div className="p-5">
            <ModalForm item={item} setItem={setItem} />
          </div>
        </Dialog>
      )}
    </>
  );
};
