import { useCallback } from "react";

import { FormElementTypes } from "@lib/types";
import { useTemplateStore } from "@components/form-builder/store";
import { blockLoader, LoaderType } from "../blockLoader";
import { useUpdateElement } from "@components/form-builder/hooks";
import { allowedTemplates } from "@formbuilder/util";

export const useHandleAdd = () => {
  const { add, setFocusInput } = useTemplateStore((s) => ({
    add: s.add,
    setFocusInput: s.setFocusInput,
  }));

  const { addElement: updateElement, isTextField } = useUpdateElement();

  /* Note this callback is also in ElementPanel */
  const handleAddElement = useCallback(
    (index: number, type?: FormElementTypes) => {
      if (allowedTemplates.includes(type as LoaderType)) {
        blockLoader(type as LoaderType, (data) => add(index, data.type, data));
        return;
      }

      setFocusInput(true);
      add(
        index,
        isTextField(type as string) && type !== FormElementTypes.textArea
          ? FormElementTypes.textField
          : type
      );
      // add 1 to index because it's a new element
      updateElement(type as string, `form.elements[${index + 1}]`);
    },
    [add, setFocusInput, updateElement, isTextField]
  );

  return { handleAddElement };
};
