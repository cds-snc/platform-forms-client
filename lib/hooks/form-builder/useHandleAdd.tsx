"use client";
import { useCallback } from "react";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { blockLoader } from "../../utils/form-builder/blockLoader";
import { allowedTemplates, TemplateTypes } from "@lib/utils/form-builder";
import {
  defaultField,
  createElement,
  setDescription,
  setTitle,
} from "@lib/utils/form-builder/itemHelper";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";
import {
  getTranslatedElementProperties,
  getTranslatedDynamicRowProperties,
} from "@formBuilder/actions";
import { useTreeRef } from "@formBuilder/components/shared/right-panel/treeview/provider/TreeRefProvider";

export const useHandleAdd = () => {
  const { add, addSubItem, setChangeKey } = useTemplateStore((s) => ({
    add: s.add,
    addSubItem: s.addSubItem,
    setChangeKey: s.setChangeKey,
  }));

  const { treeView } = useTreeRef();

  const groupId = useGroupStore((state) => state.id);

  const create = useCallback(async (type: FormElementTypes) => {
    const defaults = JSON.parse(JSON.stringify(defaultField));

    const labels = await getTranslatedElementProperties(type);
    const descriptionEn = labels.description.en;
    const descriptionFr = labels.description.fr;

    let item = createElement(defaults, type as FormElementTypes);
    item = setDescription(item, "en", descriptionEn);
    item = setDescription(item, "fr", descriptionFr);

    // If a default label exists, apply it.
    const titleEn = labels.label.en;
    const titleFr = labels.label.fr;
    if (titleEn) {
      item = setTitle(item, "en", titleEn);
    }
    if (titleFr) {
      item = setTitle(item, "fr", titleFr);
    }

    return item;
  }, []);

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    async (index: number, type?: FormElementTypes) => {
      let id;

      if (allowedTemplates.includes(type as TemplateTypes)) {
        blockLoader(type as TemplateTypes, index, async (data, position) => {
          // Note add() returns the element id -- we're not using it yet
          id = await add(position, data.type, data, groupId);
        });
        return id;
      }

      const item = await create(type as FormElementTypes);
      if (item.type === "dynamicRow") {
        item.properties.dynamicRow = await getTranslatedDynamicRowProperties();
      }
      id = await add(index, item.type, item, groupId);
      treeView?.current?.addItem(String(id));

      const el = document.getElementById(`item-${id}`);

      if (!el) return id;

      // Close all panel menus before focussing on the new element
      const closeAll = new CustomEvent("close-all-panel-menus");
      window && window.dispatchEvent(closeAll);

      el?.focus();
    },
    [add, create, groupId, treeView]
  );

  const handleAddSubElement = useCallback(
    async (elId: number, subIndex: number, type?: FormElementTypes) => {
      let id;

      // Close all panel menus before focussing on the new element
      const closeAll = new CustomEvent("close-all-panel-menus");
      window && window.dispatchEvent(closeAll);

      if (allowedTemplates.includes(type as TemplateTypes)) {
        blockLoader(type as TemplateTypes, subIndex, (data, position) => {
          id = addSubItem(elId, position, data.type, data);
          setChangeKey(String(new Date().getTime())); //Force a re-render
        });
        return id;
      }

      const item = await create(type as FormElementTypes);
      id = await addSubItem(elId, subIndex, item.type, item);
      setChangeKey(String(new Date().getTime())); //Force a re-render

      return id;
    },
    [addSubItem, create, setChangeKey]
  );

  return { handleAddElement, handleAddSubElement, create };
};
