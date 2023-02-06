import React, { useCallback } from "react";
import { useTranslation } from "next-i18next";

import { FormElementTypes } from "@lib/types";
import { LockIcon } from "../../icons";
import { AddElementButton } from "./elements/element-dialog/AddElementButton";
import { useTemplateStore } from "@components/form-builder/store";

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { t } = useTranslation("form-builder");

  const { add, setFocusInput } = useTemplateStore((s) => ({
    add: s.add,
    setFocusInput: s.setFocusInput,
  }));

  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      setFocusInput(true);
      add(index, type);
    },
    [add, setFocusInput]
  );

  return (
    <div className="z-index-[999] pl-8 pt-2 pb-2 relative flex items-center a bg-gray-200 h-[62px] last-of-type:rounded-b-md">
      <label className="flex  text-sm line-height-[38px]" data-testid="locked-item">
        <LockIcon className="inline-block mr-2 !w-7" /> {t("lockedElement")}
      </label>
      {addElement && (
        <div className="absolute top-[35px] right-[30px]">
          <AddElementButton position={-1} handleAdd={handleAddElement} />
        </div>
      )}
    </div>
  );
};
