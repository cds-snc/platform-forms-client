import React from "react";
import { useTranslation } from "next-i18next";

import { CheckBoxEmptyIcon } from "@formbuilder/icons";

export const CheckBox = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.checkbox.title")}</h3>
      <p>{t("addElementDialog.checkbox.description")}</p>

      <div className="mt-8 ml-1">
        <div className="flex flex-col">
          <div className="flex mb-5">
            <div>
              <CheckBoxEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.checkboxItem")}</div>
          </div>
          <div className="flex mb-5">
            <div>
              <CheckBoxEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.checkboxItem")}</div>
          </div>
          <div className="flex">
            <div>
              <CheckBoxEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.checkboxItem")}</div>
          </div>
        </div>
      </div>
    </>
  );
};
