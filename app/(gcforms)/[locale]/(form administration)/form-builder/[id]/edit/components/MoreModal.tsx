"use client";
import { useEffect, type JSX } from "react";
import { FormElementWithIndex } from "@lib/types/form-builder-types";
import { getElementIndexes } from "@lib/utils/form-builder/getPath";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import useModalStore from "@lib/store/useModalStore";

export const MoreModal = ({
  item,
}: {
  item: FormElementWithIndex;
  moreButton: JSX.Element | undefined;
}) => {
  const { elements } = useTemplateStore((s) => ({
    lang: s.lang,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
  }));

  const isRichText = item.type == "richText";
  const { isOpen, updateModalProperties } = useModalStore();

  useEffect(() => {
    if (item.type != "richText") {
      const indexes = getElementIndexes(item.id, elements);
      if (!indexes || indexes[0] === null || indexes[0] === undefined) return;
      updateModalProperties(item.id, elements[indexes[0]].properties);
    }
  }, [item, isOpen, isRichText, elements, updateModalProperties]);

  return null;
};
