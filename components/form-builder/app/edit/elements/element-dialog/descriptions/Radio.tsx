import React from "react";
import { useTranslation } from "next-i18next";

import { RadioEmptyIcon } from "@formbuilder/icons";

export const Radio = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.radio.title")}</h3>
      <p>{t("addElementDialog.radio.description")}</p>

      <div className="mt-8 ml-1">
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
    </>
  );
};
