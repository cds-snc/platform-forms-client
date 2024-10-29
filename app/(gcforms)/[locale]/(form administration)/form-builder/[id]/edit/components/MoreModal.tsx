"use client";
import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Button } from "@clientComponents/globals";
import { Modal } from "./index";
import { ModalButton, ModalForm } from "./index";
import { getPathString, getElementIndexes } from "@lib/utils/form-builder/getPath";
import { useRefsContext } from "./RefsContext";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import useModalStore from "@lib/store/useModalStore";

export const MoreModal = ({
  item,
  moreButton,
  onClose,
}: {
  item: FormElementWithIndex;
  moreButton: JSX.Element | undefined;
  onClose: () => void;
}) => {
  const { elements, updateField } = useTemplateStore((s) => ({
    lang: s.lang,
    updateField: s.updateField,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
  }));

  const { refs } = useRefsContext();
  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const { isOpen, modals, updateModalProperties, unsetModalField } = useModalStore();

  useEffect(() => {
    if (item.type != "richText") {
      const indexes = getElementIndexes(item.id, elements);
      if (!indexes || indexes[0] === null || indexes[0] === undefined) return;
      updateModalProperties(item.id, elements[indexes[0]].properties);
    }
  }, [item, isOpen, isRichText, elements, updateModalProperties]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSubmit = ({ item, properties }: { item: FormElementWithIndex; properties: any }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      // replace all of "properties" with the new properties set in the ModalForm
      updateField(getPathString(item.id, elements), properties);
      onClose(); // Let the PanelBody know that the modal is closed so it can refresh.
    };
  };

  const renderSaveButton = () => {
    return (
      <ModalButton isOpenButton={false}>
        {modals[item.id] && (
          <Button
            data-testid="more-modal-save-button"
            className="mr-4"
            onClick={handleSubmit({ item, properties: modals[item.id] })}
          >
            {t("save")}
          </Button>
        )}
      </ModalButton>
    );
  };

  return (
    <Modal
      title={t("moreOptions")}
      openButton={moreButton}
      saveButton={renderSaveButton()}
      handleClose={() => {
        refs && refs.current && refs.current[item.id] && refs.current[item.id].focus();
      }}
    >
      {!isRichText && modals[item.id] && (
        <ModalForm
          item={item}
          properties={modals[item.id]}
          updateModalProperties={updateModalProperties}
          unsetModalField={unsetModalField}
        />
      )}
    </Modal>
  );
};
