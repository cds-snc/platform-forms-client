"use client";
import React, { useEffect } from "react";
import { useTranslation } from "@i18n/client";

import { ElementProperties } from "@lib/types";
import { ModalForm, ModalButton } from "../../index";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { Button } from "@clientComponents/globals";
import { Modal } from "../../Modal";
import useModalStore from "@lib/store/useModalStore";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const SubElementModal = ({
  item,
  elIndex,
  subIndex,
  moreButton,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  subIndex: number;
  moreButton: JSX.Element | undefined;
}) => {
  const { t } = useTranslation("form-builder");
  const { modals, updateModalProperties, unsetModalField } = useModalStore();

  const { updateField, setChangeKey } = useTemplateStore((s) => ({
    updateField: s.updateField,
    setChangeKey: s.setChangeKey,
  }));

  const forceRefresh = () => {
    setChangeKey(String(new Date().getTime())); //Force a re-render
  };

  useEffect(() => {
    if (item.type != "richText") {
      updateModalProperties(item.index, item.properties);
    }
  }, [item, updateModalProperties]);

  const handleSubmit = ({
    elIndex,
    subIndex,
    properties,
  }: {
    elIndex: number;
    subIndex: number;
    properties: ElementProperties;
  }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();

      // replace all of "properties" with the new properties set in the ModalForm
      updateField(
        `form.elements[${elIndex}].properties.subElements[${subIndex}].properties`,
        properties
      );

      forceRefresh();
    };
  };

  return (
    <Modal
      title={t("moreOptions")}
      openButton={moreButton}
      saveButton={
        <ModalButton isOpenButton={false}>
          {modals[item.index] && (
            <Button
              className="mr-4"
              onClick={handleSubmit({ elIndex, subIndex, properties: modals[item.index] })}
            >
              {t("save")}
            </Button>
          )}
        </ModalButton>
      }
    >
      <ModalForm
        item={item}
        properties={modals[item.index]}
        updateModalProperties={updateModalProperties}
        unsetModalField={unsetModalField}
      />
    </Modal>
  );
};
