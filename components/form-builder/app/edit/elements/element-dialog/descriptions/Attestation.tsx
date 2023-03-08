import React from "react";
import { useTranslation } from "next-i18next";

import { CheckBoxEmptyIcon } from "@formbuilder/icons";

export const Attestation = ({ title, description }: { title: string; description: string }) => {
  const { t } = useTranslation("form-builder");
  return (
    <div>
      <div className="font-bold text-[1.5rem]">{title}</div>
      <p className="mb-2">{description}</p>

      <div className="mt-8 ml-1">
        <p className="mb-5 font-bold">
          {t("addElementDialog.attest")}{" "}
          <span className="text-red-default">({t("addElementDialog.allRequired")})</span>
        </p>
        <div className="flex flex-col ml-5">
          <div className="flex mb-5">
            <div>
              <CheckBoxEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.condition1")}</div>
          </div>
          <div className="flex mb-5">
            <div>
              <CheckBoxEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.condition1")}</div>
          </div>
          <div className="flex">
            <div>
              <CheckBoxEmptyIcon className="scale-150" />
            </div>
            <div className="-mt-1 ml-5">{t("addElementDialog.condition3")}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
