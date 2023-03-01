import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, Language, ElementOptionsFilter } from "../../types";
import { SelectedElement, ElementDropDown, ElementRequired, useGetSelectedOption } from ".";
import { Question } from "./elements";
import { FormElement } from "@lib/types";
import { QuestionDescription } from "./elements/question/QuestionDescription";

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
  const initialSelected = useGetSelectedOption(item);
  const [selectedItem, setSelectedItem] = useState<ElementOption>();
  const questionInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedItem?.id !== initialSelected.id) {
      setSelectedItem(initialSelected);
    }
  }, [initialSelected, selectedItem?.id]);

  // Filter out the dynamicRow element from the dropdown if we're in a sub panel
  const elementFilter: ElementOptionsFilter = (elements) => {
    return elements.filter((element) => element.id !== "dynamicRow");
  };

  // don't allow swapping to attestation
  const attestationFilter: ElementOptionsFilter = (elements) => {
    return elements.filter((element) => element.id !== "attestation");
  };

  return (
    <div className="mx-7 py-7">
      <div
        className={
          "" +
          (isRichText || isDynamicRow
            ? "relative "
            : "flex flex-row-reverse gap-x-4 xxl:flex-col justify-between relative text-base !text-sm")
        }
      >
        {!isRichText && !isDynamicRow && selectedItem?.id && (
          <div className="xxl:mt-4 w-2/5 xxl:w-full">
            <ElementDropDown
              filterElements={elIndex === -1 ? attestationFilter : elementFilter}
              item={item}
              onElementChange={onElementChange}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
            />
          </div>
        )}
        <div className={isRichText || isDynamicRow ? undefined : "xxl:mt-4 w-3/5 xxl:w-full"}>
          <Question
            questionInputRef={questionInputRef}
            elements={elements}
            elIndex={elIndex}
            item={item}
            onQuestionChange={onQuestionChange}
          />
        </div>
      </div>
      <div className="flex gap-x-4 xxl:flex-col justify-between relative text-base !text-sm">
        <div className="w-3/5">
          {!isRichText && <QuestionDescription item={item} itemIndex={elIndex} />}

          {selectedItem?.id && (
            <SelectedElement item={item} selected={selectedItem} elIndex={elIndex} />
          )}
          {maxLength && (
            <div className="disabled">
              {t("maxCharacterLength")}
              {maxLength}
            </div>
          )}
        </div>
        <div className="w-2/5">
          {!isDynamicRow && !isRichText && (
            <ElementRequired onRequiredChange={onRequiredChange} item={item} />
          )}
          {item.properties.autoComplete && (
            <div className="mt-5">
              <strong>Autcomplete is set to:</strong>{" "}
              {t(`autocompleteOptions.${item.properties.autoComplete}`)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
