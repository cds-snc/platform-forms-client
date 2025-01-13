"use client";
import React from "react";
import { Button } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { MoreIcon } from "@serverComponents/icons/MoreIcon";
import { EventKeys, useCustomEvent } from "@lib/hooks/useCustomEvent";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { useTemplateStore } from "@lib/store/useTemplateStore";

export const CustomizeSetButton = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const { Event } = useCustomEvent();

  const { getFormElementWithIndexById } = useTemplateStore((s) => ({
    getFormElementWithIndexById: s.getFormElementWithIndexById,
  }));

  const openDialog = (item: FormElementWithIndex) => {
    // Ensure we have the latest form element
    const formElement = getFormElementWithIndexById(item.id);
    Event.fire(EventKeys.openDynamicRowDialog, {
      item: formElement,
    });
  };

  return (
    <>
      <div className="mb-4">
        <Button
          onClick={() => {
            openDialog(item);
          }}
          theme="link"
          className="group/button mb-2 !px-4 !py-2 text-sm leading-6"
        >
          <>
            <MoreIcon className="mr-2 size-[24px] rounded-sm border-1 border-black group-focus/button:border-white group-focus/button:fill-white" />
            {t("dynamicRow.dialog.customizeElement")}
          </>
        </Button>
      </div>
    </>
  );
};
