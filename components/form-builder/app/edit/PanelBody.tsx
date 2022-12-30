import React, { useState } from "react";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex } from "../../types";
import { SelectedElement, getSelectedOption, ElementDropDown, ElementRequired } from ".";

import { Question } from "./elements";

export const PanelBody = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const isRichText = item.type === "richText";
  const properties = item.properties;
  const maxLength = properties.validation?.maxLength;

  return (
    <div className={isRichText ? "mt-7" : "mx-7 my-7"}>
      <div className="element-panel flex xxl:flex-col-reverse flex-row justify-between relative text-base !text-sm">
        <div
          style={isRichText ? { width: "100%", margin: 0, fontSize: "1.25em" } : {}}
          className={isRichText ? undefined : "basis-[460px] xxl:basis-[10px] mr-5"}
        >
          <Question item={item} />
          <SelectedElement item={item} selected={selectedItem} />
          {maxLength && (
            <div className="disabled">
              {t("maxCharacterLength")}
              {maxLength}
            </div>
          )}
        </div>
        {!isRichText && (
          <div>
            <ElementDropDown
              item={item}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
            <ElementRequired item={item} />
          </div>
        )}
      </div>
    </div>
  );
};
