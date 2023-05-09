import { useCallback } from "react";
import { useTranslation } from "next-i18next";

import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@components/form-builder/store";
import { blockLoader, LoaderType } from "../blockLoader";
import { allowedTemplates } from "@formbuilder/util";
import {
  defaultField,
  createElement,
  setTitle,
  setDescription,
} from "@formbuilder/utils/itemHelper";

export const useHandleAdd = () => {
  const { add, addSubItem } = useTemplateStore((s) => ({
    add: s.add,
    addSubItem: s.addSubItem,
  }));

  const { t } = useTranslation("form-builder");

  const create = useCallback(
    (type: FormElementTypes) => {
      const defaults = JSON.parse(JSON.stringify(defaultField));
      const titleEn = t([`addElementDialog.${type}.label`, ""], { lng: "en" });
      const descriptionEn = t([`defaultElementDescription.${type}`, ""], { lng: "en" });
      const titleFr = t([`addElementDialog.${type}.label`, ""], { lng: "fr" });
      const descriptionFr = t([`defaultElementDescription.${type}`, ""], { lng: "fr" });

      let item = createElement(defaults, type as FormElementTypes);
      item = setTitle(item, "en", titleEn);
      item = setDescription(item, "en", descriptionEn);

      item = setTitle(item, "fr", titleFr);
      item = setDescription(item, "fr", descriptionFr);
      return item;
    },
    [t]
  );

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, index, (data, position) => {
          add(position, data.type, data);
        });
        return;
      }

      const item = create(type as FormElementTypes);
      add(index, item.type, item);
    },
    [add, create]
  );

  const handleAddSubElement = useCallback(
    (elIndex: number, subIndex: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, subIndex, (data, position) =>
          addSubItem(elIndex, position, data.type, data)
        );
        return;
      }

      const item = create(type as FormElementTypes);
      addSubItem(elIndex, subIndex, item.type, item);
    },
    [addSubItem, create]
  );

  return { handleAddElement, handleAddSubElement, create };
};
