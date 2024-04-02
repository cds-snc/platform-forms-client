"use client";
import { useCallback } from "react";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store";
import { blockLoader, LoaderType } from "../../utils/form-builder/blockLoader";
import { allowedTemplates } from "@lib/utils/form-builder";
import { defaultField, createElement, setDescription } from "@lib/utils/form-builder/itemHelper";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store";
import { treeContextType } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";
import { getTranslatedElementProperties } from "@formBuilder/actions";

export const useHandleAdd = (treeRefContext?: treeContextType) => {
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

    let item = createElement(defaults, type as FormElementTypes);
    item = setDescription(item, "en", descriptionEn);
    item = setDescription(item, "fr", descriptionFr);
    return item;
  }, []);

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    async (index: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, index, async (data, position) => {
          // Note add() returns the element id -- we're not using it yet
          await add(position, data.type, data, groupId);
        });
        return;
      }

      const item = await create(type as FormElementTypes);
      // Note add() returns the element id -- we're not using it yet
      const id = await add(index, item.type, item, groupId);
      if (treeRefContext && treeRefContext.treeRef) {
        await new Promise((resolve) => setTimeout(resolve, 200)); // @TODO
        treeRefContext.environmentRef.current.
      }
    },
    [add, create, groupId, treeRefContext]
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
