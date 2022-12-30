import React, { useState } from "react";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, LocalizedElementProperties } from "../../types";
import {
  QuestionInput,
  SelectedElement,
  getSelectedOption,
  ElementDropDown,
  ElementRequired,
} from ".";
import { useTemplateStore } from "../../store";

export const PanelBody = ({ item }: { item: FormElementWithIndex }) => {
  const isRichText = item.type == "richText";
  const { t } = useTranslation("form-builder");
  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const { localizeField, elements, updateField, translationLanguagePriority } = useTemplateStore(
    (s) => ({
      localizeField: s.localizeField,
      elements: s.form.elements,
      updateField: s.updateField,
      unsetField: s.unsetField,
      resetChoices: s.resetChoices,
      translationLanguagePriority: s.translationLanguagePriority,
    })
  );

  const questionNumber =
    elements
      .filter((item) => item.type != "richText")
      .findIndex((object) => object.id === item.id) + 1;

  const hasDescription =
    item.properties[
      localizeField(LocalizedElementProperties.DESCRIPTION, translationLanguagePriority)
    ];

  return (
    <div className={isRichText ? "mt-7" : "mx-7 my-7"}>
      <div className="element-panel flex xxl:flex-col-reverse flex-row justify-between relative text-base !text-sm">
        <div
          style={isRichText ? { width: "100%", margin: 0, fontSize: "1.25em" } : {}}
          className={isRichText ? undefined : "basis-[460px] xxl:basis-[10px] mr-5"}
        >
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
            <div
              className="mt-5 cursor-not-allowed rounded-sm p-2 bg-gray-100 text-gray-600"
              id={`item${item.index}-describedby`}
            >
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
              <ElementDropDown
                item={item}
                selectedItem={selectedItem}
                setSelectedItem={setSelectedItem}
              />
              <ElementRequired item={item} updateField={updateField} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
