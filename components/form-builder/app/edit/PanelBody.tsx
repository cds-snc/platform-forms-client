import React, { useRef, useState } from "react";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, Language, ElementOptionsFilter } from "../../types";
import { SelectedElement, ElementDropDown, ElementRequired, useGetSelectedOption } from ".";
import { Question } from "./elements";
import { FormElement } from "@lib/types";

export const PanelBody = ({
  item,
  elIndex = -1,
  elements,
  onElementChange,
  onQuestionChange,
  onRequiredChange,
}: {
  item: FormElementWithIndex;
  elIndex?: number;
  elements: FormElement[];
  onElementChange: (id: string, itemIndex: number) => void;
  onQuestionChange: (itemIndex: number, val: string, lang: Language) => void;
  onRequiredChange: (itemIndex: number, checked: boolean) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type === "richText";
  const isDynamicRow = item.type === "dynamicRow";
  const properties = item.properties;
  const maxLength = properties?.validation?.maxLength;
  const [selectedItem, setSelectedItem] = useState<ElementOption>(useGetSelectedOption(item));
  const questionInputRef = useRef<HTMLInputElement>(null);

  // Filter out the dynamicRow element from the dropdown if we're in a sub panel
  const elementFilter: ElementOptionsFilter = (elements) => {
    return elements.filter((element) => element.id !== "dynamicRow");
  };

  return (
    <div className="mx-7 py-7">
      <div
        className={
          "" +
          (isRichText || isDynamicRow
            ? ""
            : "flex flex-row-reverse xxl:flex-col justify-between relative text-base !text-sm ")
        }
      >
        {!isRichText && !isDynamicRow && (
          <div className="xxl:mt-4">
            <ElementDropDown
              filterElements={elIndex === -1 ? undefined : elementFilter}
              item={item}
              onElementChange={onElementChange}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          </div>
        )}
        <div className={isRichText || isDynamicRow ? undefined : "xxl:mt-4"}>
          <Question
            questionInputRef={questionInputRef}
            elements={elements}
            elIndex={elIndex}
            item={item}
            onQuestionChange={onQuestionChange}
          />
          <SelectedElement item={item} selected={selectedItem} elIndex={elIndex} />
          {maxLength && (
            <div className="disabled">
              {t("maxCharacterLength")}
              {maxLength}
            </div>
          )}
          {!isDynamicRow && !isRichText && (
            <ElementRequired onRequiredChange={onRequiredChange} item={item} />
          )}
        </div>
      </div>
    </div>
  );
};
