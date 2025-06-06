"use client";
import { useCallback } from "react";
import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { blockLoader } from "../../utils/form-builder/blockLoader";
import { elementLoader } from "@lib/utils/form-builder/elementLoader";
import { logMessage } from "@lib/logger";

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
import { toast } from "@formBuilder/components/shared/Toast";
import { useTranslation } from "@i18n/client";
import { v4 as uuid } from "uuid";

export const useHandleAdd = () => {
  const { add, addSubItem, setChangeKey } = useTemplateStore((s) => ({
    add: s.add,
    addSubItem: s.addSubItem,
    setChangeKey: s.setChangeKey,
  }));

  const { t } = useTranslation("form-builder");

  const { treeView } = useTreeRef();

  const groupId = useGroupStore((state) => state.id);

  const create = useCallback(async (type: FormElementTypes) => {
    const defaults = {
      ...defaultField,
      uuid: uuid(),
      properties: { ...defaultField.properties, validation: { required: false } },
    };

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

  const loadError = t("failedToReadFormFile");

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    async (index: number, type?: FormElementTypes) => {
      let id;

      if (type === "customJson") {
        try {
          await elementLoader(index, async (data, position) => {
            id = await add(position, data.type, data, groupId);
          });
        } catch (e) {
          logMessage.info(`${(e as Error).message}`);
          toast.error(loadError);
        }

        return id;
      }

      if (allowedTemplates.includes(type as TemplateTypes)) {
        try {
          await blockLoader(type as TemplateTypes, index, async (data, position) => {
            id = await add(position, data.type, data, groupId);
          });
        } catch (e) {
          toast.error(loadError);
        }
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
    [add, create, groupId, treeView, loadError]
  );

  const handleAddSubElement = useCallback(
    async (elId: number, subIndex: number, type?: FormElementTypes) => {
      let id;

      // Close all panel menus before focussing on the new element
      const closeAll = new CustomEvent("close-all-panel-menus");
      window && window.dispatchEvent(closeAll);

      //

      if (type === "customJson") {
        try {
          await elementLoader(subIndex, async (data, position) => {
            id = addSubItem(elId, position, data.type, data);
          });
        } catch (e) {
          logMessage.info(`${(e as Error).message}`);
          toast.error(loadError);
        }

        return id;
      }

      //

      if (allowedTemplates.includes(type as TemplateTypes)) {
        try {
          blockLoader(type as TemplateTypes, subIndex, (data, position) => {
            id = addSubItem(elId, position, data.type, data);
            setChangeKey(String(new Date().getTime())); //Force a re-render
          });
          return id;
        } catch (e) {
          toast.error(loadError);
        }
      }

      const item = await create(type as FormElementTypes);
      id = await addSubItem(elId, subIndex, item.type, item);
      setChangeKey(String(new Date().getTime())); //Force a re-render

      return id;
    },
    [addSubItem, create, setChangeKey, loadError]
  );

  return { handleAddElement, handleAddSubElement, create };
};
