import React, { useCallback } from "react";
import { UseSelectStateChange } from "downshift";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex } from "../../types";
import { DropDown } from "./elements";
import { useElementOptions } from "../../hooks";

export const ElementDropDown = ({
  item,
  onElementChange,
  selectedItem,
  setSelectedItem,
}: {
  item: FormElementWithIndex;
  onElementChange: (id: string, itemIndex: number) => void;
  selectedItem: ElementOption;
  setSelectedItem: (selectedItem: ElementOption) => void;
}) => {
  const { t } = useTranslation("form-builder");
  const elementOptions = useElementOptions();

  const itemIndex = item.index;

  const handleElementChange = useCallback(
    ({ selectedItem }: UseSelectStateChange<ElementOption | null | undefined>) => {
      if (selectedItem) {
        setSelectedItem(selectedItem);
        onElementChange(selectedItem.id, itemIndex);
      }
    },
    [setSelectedItem, onElementChange]
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
