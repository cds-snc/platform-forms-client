import React from "react";
import { useTranslation } from "next-i18next";

import { ModalForm } from "../index";
import { FormElementWithIndex } from "../../../types";
import { useModalStore } from "../../../store";
import { Button } from "../../shared";
import { Modal } from "../Modal";

import { ThreeDotsIcon } from "@components/form-builder/icons";

export const DynamicRowModal = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const { modals, updateModalProperties, unsetModalField } = useModalStore();

  const iconClasses =
    "group-hover:group-enabled:fill-white-default group-disabled:fill-gray-500 group-focus:fill-white-default transition duration-100";

  return (
    <Modal
      title={t("moreOptions")}
      openButton={
        <Button
          theme="secondary"
          className="btn inline-block ml-5 !border-1.5 leading-6 text-sm"
          iconWrapperClassName="!w-7 !mr-0"
          icon={<ThreeDotsIcon className={`${iconClasses}`} />}
          onClick={() => null}
        >
          <span className="text-sm mx-3 xl:mx-0">{t("more")}</span>
        </Button>
      }
      saveButton={"save"}
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
