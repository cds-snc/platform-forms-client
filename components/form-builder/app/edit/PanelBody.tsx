import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "next-i18next";

import {
  ElementOption,
  FormElementWithIndex,
  Language,
  ElementOptionsFilter,
  LocalizedElementProperties,
} from "../../types";
import { SelectedElement, ElementDropDown, ElementRequired, useGetSelectedOption } from ".";
import { Question } from "./elements";
import { FormElement } from "@lib/types";
import { QuestionDescription } from "./elements/question/QuestionDescription";
import { useTemplateStore } from "@components/form-builder/store";
import { allowedTemplates } from "@formbuilder/util";

import { LoaderType } from "../../blockLoader";

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

  // Filter out the dynamicRow element
  // and "templated" blocks i.e. multi field blocks
  // as "swappable" elements if we're in a sub panel
  const dynamicRowFilter: ElementOptionsFilter = (elements) => {
    return elements.filter((element) => {
      return element.id !== "dynamicRow" && !allowedTemplates.includes(element.id as LoaderType);
    });
  };

  // filter out allow "templated" blocks i.e. multi field blocks
  // as "swappable" elements
  const elementFilter: ElementOptionsFilter = (elements) => {
    return elements.filter((element) => !allowedTemplates.includes(element.id as LoaderType));
  };

  const { localizeField, translationLanguagePriority } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const description =
    properties[localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)];

  const describedById = description ? `item${item.id}-describedby` : undefined;

  return (
    <>
      {isRichText || isDynamicRow ? (
        <>
          <Question
            questionInputRef={questionInputRef}
            elements={elements}
            elIndex={elIndex}
            item={item}
            onQuestionChange={onQuestionChange}
          />
          {selectedItem?.id && (
            <SelectedElement item={item} selected={selectedItem} elIndex={elIndex} />
          )}
        </>
      ) : (
        <>
          <div className="flex flex-row-reverse gap-x-4 xxl:flex-col justify-between text-sm">
            {selectedItem?.id && (
              <div className="xxl:mt-4 w-2/5 xxl:w-full">
                <ElementDropDown
                  filterElements={elIndex === -1 ? elementFilter : dynamicRowFilter}
                  item={item}
                  onElementChange={onElementChange}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                />
              </div>
            )}
            <div className="xxl:mt-4 w-3/5 xxl:w-full">
              <Question
                questionInputRef={questionInputRef}
                elements={elements}
                elIndex={elIndex}
                item={item}
                onQuestionChange={onQuestionChange}
                describedById={describedById}
              />
            </div>
          </div>
          <div className="flex gap-x-4 xxl:flex-col justify-between text-sm">
            <div className="w-3/5 xxl:w-full">
              <QuestionDescription item={item} describedById={describedById} />

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
            <div className="w-2/5 xxl:w-full">
              <ElementRequired onRequiredChange={onRequiredChange} item={item} />
              {item.properties.autoComplete && (
                <div className="mt-5">
                  <strong>Autcomplete is set to:</strong>{" "}
                  {t(`autocompleteOptions.${item.properties.autoComplete}`)}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
};
