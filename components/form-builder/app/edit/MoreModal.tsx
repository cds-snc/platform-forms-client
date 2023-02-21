import React, { useEffect } from "react";
import { useTranslation } from "next-i18next";

import { FormElementWithIndex } from "../../types";
import { useTemplateStore, useModalStore } from "../../store";
import { Button } from "../shared";
import { Modal } from "./index";
import { ModalButton, ModalForm } from "./index";

export const MoreModal = ({
  item,
  moreButton,
}: {
  item: FormElementWithIndex;
  moreButton: JSX.Element | undefined;
}) => {
  const { elements, updateField } = useTemplateStore((s) => ({
    lang: s.lang,
    updateField: s.updateField,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
  }));

  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";

  const { isOpen, modals, updateModalProperties, unsetModalField } = useModalStore();

  useEffect(() => {
    if (item.type != "richText") {
      updateModalProperties(item.index, elements[item.index].properties);
    }
  }, [item, isOpen, isRichText, elements, updateModalProperties]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSubmit = ({ item, properties }: { item: FormElementWithIndex; properties: any }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      // replace all of "properties" with the new properties set in the ModalForm
      updateField(`form.elements[${item.index}].properties`, properties);
    };
  };

  const renderSaveButton = () => {
    return (
      <ModalButton isOpenButton={false}>
        {modals[item.index] && (
          <Button className="mr-4" onClick={handleSubmit({ item, properties: modals[item.index] })}>
            {t("save")}
          </Button>
        )}
      </ModalButton>
    );
  };

  return (
    <Modal title={t("moreOptions")} openButton={moreButton} saveButton={renderSaveButton()}>
      {!isRichText && modals[item.index] && (
        <ModalForm
          item={item}
          properties={modals[item.index]}
          updateModalProperties={updateModalProperties}
          unsetModalField={unsetModalField}
        />
      )}
    </Modal>
  );
};
