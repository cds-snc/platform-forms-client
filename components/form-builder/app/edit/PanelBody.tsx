import React, { useState } from "react";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, LocalizedElementProperties } from "../../types";
import { SelectedElement, getSelectedOption, ElementDropDown, ElementRequired } from ".";
import { useTemplateStore } from "../../store";

import { Question } from "./elements";

export const PanelBody = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const [selectedItem, setSelectedItem] = useState<ElementOption>(getSelectedOption(item));

  const { localizeField, updateField, unsetField, resetChoices, translationLanguagePriority } =
    useTemplateStore((s) => ({
      localizeField: s.localizeField,
      elements: s.form.elements,
      updateField: s.updateField,
      unsetField: s.unsetField,
      resetChoices: s.resetChoices,
      translationLanguagePriority: s.translationLanguagePriority,
    }));

  const isRichText = item.type === "richText";
  const properties = item.properties;
  const maxLength = properties.validation?.maxLength;

  // all element state updaters should be setup at this level
  // we should be able to pass and `item` + `updaters`to build up each element panel
  // i.e. we should be able to pass a sub element item or a top level update
  // and make updates to the store accordingly
  // the `panel body` should be the ony thing that knows about the store
  // and the only thing that should be able to update the store
  const _updateState = (id: string, itemIndex: number) => {
    switch (id) {
      case "text":
      case "textField":
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(`form.elements[${itemIndex}].type`, "textField");

        if (id === "textField" || id === "text") {
          unsetField(`form.elements[${itemIndex}].properties.validation.type`);
        } else {
          updateField(`form.elements[${itemIndex}].properties.validation.type`, id);
          unsetField(`form.elements[${itemIndex}].properties.validation.maxLength`);
        }
        break;
      case "richText":
        resetChoices(itemIndex);
      // no break here (we want default to happen)
      default: // eslint-disable-line no-fallthrough
        updateField(`form.elements[${itemIndex}].type`, id);
        unsetField(`form.elements[${itemIndex}].properties.validation.type`);
        unsetField(`form.elements[${itemIndex}].properties.validation.maxLength`);
        break;
    }
  };

  const _setDefaultDescription = (id: string, itemIndex: number) => {
    switch (id) {
      case "email":
      case "phone":
      case "date":
      case "number":
        updateField(
          `form.elements[${itemIndex}].properties.${
            (localizeField(LocalizedElementProperties.DESCRIPTION), translationLanguagePriority)
          }`,
          t(`defaultElementDescription.${id}`)
        );
        break;
      default:
        break;
    }
  };

  // todo --- we should be able to make this generic for top level and sub level elements
  // it can become it's own component
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
              stateUpdater={_updateState}
              descriptionUpdater={_setDefaultDescription}
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
