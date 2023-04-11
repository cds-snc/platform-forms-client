import React from "react";
import { ChevronDown } from "@formbuilder/icons";
import { useTranslation } from "react-i18next";

export const DropDown = () => {
  const { t } = useTranslation("form-builder");
  return (
    <>
      <h3 className="mb-0">{t("addElementDialog.dropdown.title")}</h3>
      <p>{t("addElementDialog.dropdown.description")}</p>

      <div className="mt-8 ml-1">
        <div className="flex rounded justify-between outline outline-offset-2 outline-blue-focus border-2 border-black w-[280px] p-1 px-2">
          <div>Select</div>{" "}
          <div className="mt-1">
            <ChevronDown className="scale-125" />
          </div>
        </div>

        <div className="rounded mt-3 outline outline-2 outline-blue-focus">
          <div className="border-b-2 p-1 px-2">option</div>
          <div className="border-b-2 p-1 px-2">option</div>
          <div className="border-b-2 p-1 px-2">option</div>
        </div>
      </div>
    </>
  );
};
