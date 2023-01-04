import React, { useState } from "react";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, Language } from "../../types";
import { SelectedElement, useGetSelectedOption, ElementDropDown, ElementRequired } from ".";
import { Question } from "./elements";

export const PanelBody = ({
  item,
  onElementChange,
  onQuestionChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  onElementChange: (id: string, itemIndex: number) => void;
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
  onRequiredChange: (itemIndex: number, checked: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type === "richText";
  const properties = item.properties;
  const maxLength = properties.validation?.maxLength;
  const [selectedItem, setSelectedItem] = useState<ElementOption>(useGetSelectedOption(item));

  return (
    <div className={isRichText ? "mt-7" : "mx-7 my-7"}>
      <div className="element-panel flex xxl:flex-col-reverse flex-row justify-between relative text-base !text-sm">
        <div
          style={isRichText ? { width: "100%", margin: 0, fontSize: "1.25em" } : {}}
          className={isRichText ? undefined : "basis-[460px] xxl:basis-[10px] mr-5"}
        >
          <Question item={item} onQuestionChange={onQuestionChange} />
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
              onElementChange={onElementChange}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
            <ElementRequired onRequiredChange={onRequiredChange} item={item} />
          </div>
        )}
      </div>
    </div>
  );
};
