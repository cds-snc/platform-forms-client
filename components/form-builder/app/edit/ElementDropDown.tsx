import React, { useCallback } from "react";
import { UseSelectStateChange } from "downshift";
import { useTranslation } from "next-i18next";

import { ElementOption, FormElementWithIndex } from "../../types";
import { DropDown } from "./elements";
import { useElementOptions } from "../../hooks";

export const ElementDropDown = ({
  item,
  stateUpdater,
  descriptionUpdater,
  selectedItem,
  setSelectedItem,
}: {
  item: FormElementWithIndex;
  stateUpdater: (id: string, itemIndex: number) => void;
  descriptionUpdater: (id: string, itemIndex: number) => void;
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
        stateUpdater(selectedItem.id, itemIndex);
        descriptionUpdater(selectedItem.id, itemIndex);
      }
    },
    [setSelectedItem, stateUpdater, descriptionUpdater]
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
