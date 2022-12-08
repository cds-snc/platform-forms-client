import React, { useState, useCallback } from "react";
import { UseSelectStateChange } from "downshift";
import styled from "styled-components";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, LocalizedElementProperties } from "../../types";
import { QuestionInput, SelectedElement, getSelectedOption } from ".";
import { DropDown } from "./elements";
import { useTemplateStore } from "../../store";
import { Checkbox } from "../shared";
import { useElementOptions } from "../../hooks";

interface RowProps {
  isRichText: boolean;
}

const Row = styled.div<RowProps>`
  display: flex;
  justify-content: space-between;
  position: relative;
  font-size: 16px;
  & > div {
    ${({ isRichText }) =>
      isRichText &&
      `
      width: 100%;
      margin: 0;
      font-size: 1.25em;
    `}
  }
`;

export const PanelBody = ({ item }: { item: FormElementWithIndex }) => {
  const isRichText = item.type == "richText";
  const { t } = useTranslation("form-builder");
  const elementOptions = useElementOptions();
  const {
    localizeField,
    elements,
    updateField,
    unsetField,
    resetChoices,
    translationLanguagePriority,
  } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    elements: s.form.elements,
    updateField: s.updateField,
    unsetField: s.unsetField,
    resetChoices: s.resetChoices,
    translationLanguagePriority: s.translationLanguagePriority,
  }));

  const questionNumber =
    elements
      .filter((item) => item.type != "richText")
      .findIndex((object) => object.id === item.id) + 1;

  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const _updateState = (id: string, index: number) => {
    switch (id) {
      case "text":
      case "textField":
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(`form.elements[${index}].type`, "textField");

        if (id === "textField" || id === "text") {
          unsetField(`form.elements[${index}].properties.validation.type`);
        } else {
          updateField(`form.elements[${index}].properties.validation.type`, id);
          unsetField(`form.elements[${index}].properties.validation.maxLength`);
        }
        break;
      case "richText":
        resetChoices(index);
      // no break here (we want default to happen)
      default: // eslint-disable-line no-fallthrough
        updateField(`form.elements[${index}].type`, id);
        unsetField(`form.elements[${index}].properties.validation.type`);
        unsetField(`form.elements[${index}].properties.validation.maxLength`);
        break;
    }
  };

  const _setDefaultDescription = (id: string, index: number) => {
    switch (id) {
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(
          `form.elements[${index}].properties.${
            (localizeField(LocalizedElementProperties.DESCRIPTION), translationLanguagePriority)
          }`,
          t(`defaultElementDescription.${id}`)
        );
        break;
      default:
        break;
    }
  };

  const handleElementChange = useCallback(
    ({ selectedItem }: UseSelectStateChange<ElementOption | null | undefined>) => {
      if (selectedItem) {
        setSelectedItem(selectedItem);
        _updateState(selectedItem.id, item.index);
        _setDefaultDescription(selectedItem.id, item.index);
      }
    },
    [setSelectedItem]
  );

  const hasDescription =
    item.properties[
      localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
    ];

  return (
    <div className={isRichText ? "mt-7" : "mx-7 my-7"}>
      <Row isRichText={isRichText} className="element-panel flex xxl:flex-col-reverse flex-row">
        <div className={isRichText ? undefined : "basis-[460px] xxl:basis-[10px] mr-5"}>
          {!isRichText && (
            <>
              <span
                className={`absolute left-0 bg-gray-default py-2.5 rounded-r -ml-7 ${
                  item.index < 9 ? "px-1.5" : "pl-0.5 pr-1 tracking-tighter"
                }`}
              >
                {questionNumber}
              </span>
              <label
                className="mb-1 sr-only block font-[700] absolute w-px h-px p-0 -m-px overflow-hidden whitespace-no-wrap border-0"
                style={{ clip: "rect(0, 0, 0, 0)" }}
                htmlFor={`item${item.index}`}
              >
                {t("question")} {item.index + 1}
              </label>
              <QuestionInput
                initialValue={
                  item.properties[
                    localizeField(LocalizedElementProperties.TITLE, translationLanguagePriority)
                  ]
                }
                index={item.index}
                hasDescription={hasDescription}
              />
            </>
          )}
          {hasDescription && item.type !== "richText" && (
            <div className="disabled" id={`item${item.index}-describedby`}>
              {
                item.properties[
                  localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
                ]
              }
            </div>
          )}
          <SelectedElement item={item} selected={selectedItem} />
          {item.properties.validation?.maxLength && (
            <div className="disabled">
              {t("maxCharacterLength")}
              {item.properties.validation?.maxLength}
            </div>
          )}
        </div>
        {!isRichText && (
          <>
            <div>
              <DropDown
                ariaLabel={t("selectElement")}
                items={elementOptions}
                selectedItem={selectedItem}
                onChange={handleElementChange}
              />
              <div className="required mt-5">
                <Checkbox
                  id={`required-${item.index}-id`}
                  value={`required-${item.index}-value`}
                  checked={item.properties.validation?.required}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (!e.target) {
                      return;
                    }

                    updateField(
                      `form.elements[${item.index}].properties.validation.required`,
                      e.target.checked
                    );
                  }}
                  label={t("required")}
                ></Checkbox>
              </div>
            </div>
          </>
        )}
      </Row>
    </div>
  );
};
