"use client";
import { useCallback } from "react";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store";
import { blockLoader, LoaderType } from "../../utils/form-builder/blockLoader";
import { allowedTemplates } from "@lib/utils/form-builder";
import {
  defaultField,
  createElement,
  setTitle,
  setDescription,
} from "@lib/utils/form-builder/itemHelper";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store";
import { getTranslatedElementProperties } from "@formBuilder/actions";

export const useHandleAdd = () => {
  const { add, addSubItem } = useTemplateStore((s) => ({
    add: s.add,
    addSubItem: s.addSubItem,
  }));

  const groupId = useGroupStore((state) => state.id);

  const create = useCallback(async (type: FormElementTypes) => {
    const defaults = JSON.parse(JSON.stringify(defaultField));

    const labels = await getTranslatedElementProperties(type);
    const descriptionEn = labels.description.en;
    const descriptionFr = labels.description.fr;
    const titleEn = labels.title.en;
    const titleFr = labels.title.fr;

    let item = createElement(defaults, type as FormElementTypes);
    item = setTitle(item, "en", titleEn);
    item = setDescription(item, "en", descriptionEn);

    item = setTitle(item, "fr", titleFr);
    item = setDescription(item, "fr", descriptionFr);
    return item;
  }, []);

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    async (index: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, index, (data, position) => {
          add(position, data.type, data, groupId);
        });
        return;
      }

      const item = await create(type as FormElementTypes);
      add(index, item.type, item, groupId);
    },
    [add, create, groupId]
  );

  const handleAddSubElement = useCallback(
    async (elIndex: number, subIndex: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, subIndex, (data, position) =>
          addSubItem(elIndex, position, data.type, data)
        );
        return;
      }

      const item = await create(type as FormElementTypes);
      addSubItem(elIndex, subIndex, item.type, item);
    },
    [addSubItem, create]
  );

  return { handleAddElement, handleAddSubElement, create };
};
