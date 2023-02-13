import React from "react";
import { useTranslation } from "next-i18next";

import { ElementProperties } from "@lib/types";
import { ModalForm, ModalButton } from "../../index";
import { FormElementWithIndex } from "../../../../types";
import { useModalStore, useTemplateStore } from "../../../../store";
import { Button } from "../../../shared";
import { Modal } from "../../Modal";

import { ThreeDotsIcon } from "@components/form-builder/icons";

export const DynamicRowModal = ({
  item,
  elIndex,
  subIndex,
}: {
  item: FormElementWithIndex;
  elIndex: number;
  subIndex: number;
}) => {
  const { t } = useTranslation("form-builder");
  const { modals, updateModalProperties, unsetModalField } = useModalStore();

  const { updateField } = useTemplateStore((s) => ({
    updateField: s.updateField,
  }));

  const iconClasses =
    "group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100";

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
    };
  };

  return (
    <Modal
      title={t("moreOptions")}
      openButton={
        <Button
          theme="secondary"
          className="btn inline-block ml-5 !border-1.5 leading-6 text-sm"
          iconWrapperClassName="!w-7 !mr-0 absolute"
          icon={<ThreeDotsIcon className={`${iconClasses}`} />}
          onClick={() => {
            updateModalProperties(item.index, item.properties);
          }}
        >
          <span className="text-sm ml-5 mr-2 xl:mx-0">{t("more")}</span>
        </Button>
      }
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
