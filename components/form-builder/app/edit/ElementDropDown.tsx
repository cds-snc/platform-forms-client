import React, { useCallback } from "react";
import { UseSelectStateChange } from "downshift";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex, ElementOptionsFilter } from "../../types";
import { DropDown } from "./elements";
import { useElementOptions } from "../../hooks";

export const ElementDropDown = ({
  item,
  onElementChange,
  selectedItem,
  setSelectedItem,
  filterElements,
}: {
  item: FormElementWithIndex;
  onElementChange: (id: string, itemIndex: number) => void;
  selectedItem: ElementOption;
  setSelectedItem: (selectedItem: ElementOption) => void;
  filterElements?: ElementOptionsFilter;
}) => {
  const { t } = useTranslation("form-builder");
  const elementOptions = useElementOptions(filterElements);

  const itemIndex = item.index;

  const handleElementChange = useCallback(
    ({ selectedItem }: UseSelectStateChange<ElementOption | null | undefined>) => {
      if (selectedItem) {
        setSelectedItem(selectedItem);
        onElementChange(selectedItem.id, itemIndex);
      }
    },
    [setSelectedItem, onElementChange, itemIndex]
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
