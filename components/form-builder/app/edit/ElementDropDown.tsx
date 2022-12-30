import React, { useCallback } from "react";
import { UseSelectStateChange } from "downshift";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, LocalizedElementProperties } from "../../types";
import { DropDown } from "./elements";
import { useElementOptions } from "../../hooks";
import { useTemplateStore } from "../../store";

export const ElementDropDown = ({
  item,
  selectedItem,
  setSelectedItem,
}: {
  item: FormElementWithIndex;
  selectedItem: ElementOption;
  setSelectedItem: (selectedItem: ElementOption) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const { localizeField, updateField, unsetField, resetChoices, translationLanguagePriority } =
    useTemplateStore((s) => ({
      localizeField: s.localizeField,
      elements: s.form.elements,
      updateField: s.updateField,
      unsetField: s.unsetField,
      resetChoices: s.resetChoices,
      translationLanguagePriority: s.translationLanguagePriority,
    }));

  const elementOptions = useElementOptions();

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

  return (
    <DropDown
      ariaLabel={t("selectElement")}
      items={elementOptions}
      selectedItem={selectedItem}
      onChange={handleElementChange}
    />
  );
};
