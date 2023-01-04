import React from "react";
import { useTranslation } from "next-i18next";

import { useTemplateStore } from "../../store";
import { LockIcon } from "../../icons";
import { Button } from "../shared";

export const PanelActionsLocked = ({ addElement }: { addElement: boolean }) => {
  const { add, setFocusInput } = useTemplateStore((s) => ({
    add: s.add,
    setFocusInput: s.setFocusInput,
  }));
  const { t } = useTranslation("form-builder");
  return (
    <div className="z-index-[999] pl-8 pt-2 pb-2 relative flex items-center a bg-gray-200 h-[62px] last-of-type:rounded-b-md">
      <label className="flex  text-sm line-height-[38px]" data-testid="locked-item">
        <LockIcon className="inline-block mr-2 !w-7" /> {t("lockedElement")}
      </label>
      {addElement && (
        <div className="absolute top-[35px] right-[30px]">
          <Button
            onClick={() => {
              // ensure element gets added to start of elements array
              // add function is add(index + 1)
              setFocusInput(true);
              add(-1);
            }}
            theme="secondary"
            className="!border-1.5 !py-2 !px-4 leading-6 text-sm"
          >
            {t("addElement")}
          </Button>
        </div>
      )}
    </div>
  );
};
