import React from "react";
import { useTranslation } from "next-i18next";

import { RadioEmptyIcon } from "@formbuilder/icons";

export const Radio = () => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <div className="flex flex-col">
        <div className="flex mb-5">
          <div>
            <RadioEmptyIcon className="scale-150" />
          </div>
          <div className="-mt-1 ml-5">{t("addElementDialog.yes")}</div>
        </div>
        <div className="flex mb-5">
          <div>
            <RadioEmptyIcon className="scale-150" />
          </div>
          <div className="-mt-1 ml-5">{t("addElementDialog.no")}</div>
        </div>
        <div className="flex">
          <div>
            <RadioEmptyIcon className="scale-150" />
          </div>
          <div className="-mt-1 ml-5">{t("addElementDialog.sometimes")}</div>
        </div>
      </div>
    </div>
  );
};
