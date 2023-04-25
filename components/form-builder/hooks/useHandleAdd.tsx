import { useCallback } from "react";
import { useTranslation } from "next-i18next";

import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@components/form-builder/store";
import { blockLoader, LoaderType } from "../blockLoader";
import { useUpdateElement } from "@components/form-builder/hooks";
import { allowedTemplates } from "@formbuilder/util";
import {
  defaultField,
  createElement,
  setTitle,
  setDescription,
} from "@formbuilder/utils/itemHelper";

export const useHandleAdd = () => {
  const { add } = useTemplateStore((s) => ({
    add: s.add,
  }));

  const { t } = useTranslation("form-builder");

  const { isTextField } = useUpdateElement();

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, (data) => add(index, data.type, data));
        return;
      }

      const defaults = JSON.parse(JSON.stringify(defaultField));

      let item = createElement(defaults, type as FormElementTypes);
      item = setTitle(item, "en", t([`addElementDialog.${type}.label`, ""], { lng: "en" }));
      item = setTitle(item, "fr", t([`addElementDialog.${type}.label`, ""], { lng: "fr" }));
      item = setDescription(
        item,
        "fr",
        t([`defaultElementDescription.${type}`, ""], { lng: "en" })
      );
      item = setDescription(
        item,
        "fr",
        t([`defaultElementDescription.${type}`, ""], { lng: "fr" })
      );

      add(
        index,
        isTextField(type as string) && type !== FormElementTypes.textArea
          ? FormElementTypes.textField
          : type,
        item
      );
    },
    [add, isTextField, t]
  );

  return { handleAddElement };
};
