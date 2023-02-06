import React, { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import { FormElementWithIndex } from "../../types";
import { useTemplateStore, useModalStore } from "../../store";
import { PanelActions, ModalButton, ModalForm, PanelBodyRoot } from "./index";
import { Button } from "../shared";

export const ElementPanel = ({ item }: { item: FormElementWithIndex }) => {
  const { t } = useTranslation("form-builder");
  const isRichText = item.type == "richText";
  const { lang, elements, getFocusInput, updateField } = useTemplateStore((s) => ({
    lang: s.lang,
    updateField: s.updateField,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
  }));

  const { isOpen, modals, updateModalProperties, unsetModalField } = useModalStore();

  const [className, setClassName] = useState<string>("");
  const [ifFocus, setIfFocus] = useState<boolean>(false);

  if (ifFocus === false) {
    // Only run this 1 time
    setIfFocus(true);

    // getFocusInput is only ever true if we press "duplicate" or "add question"
    if (getFocusInput()) {
      setClassName(
        "bg-yellow-100 transition-colors ease-out duration-[1500ms] delay-500 outline-[2px] outline-blue-focus outline"
      );
    }
  }

  useEffect(() => {
    // remove the yellow background immediately, CSS transition will fade the colour
    setClassName(className.replace("bg-yellow-100 ", ""));
    // remove the blue outline after 2.1 seconds
    setTimeout(() => setClassName(""), 2100);
  }, [className]);

  useEffect(() => {
    if (item.type != "richText") {
      updateModalProperties(item.index, elements[item.index].properties);
    }
  }, [item, isOpen, isRichText, elements, updateModalProperties]);

  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  const handleSubmit = ({ item, properties }: { item: FormElementWithIndex; properties: any }) => {
    return (e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
      // replace all of "properties" with the new properties set in the ModalForm
      updateField(`form.elements[${item.index}].properties`, properties);
    };
  };

  return (
    <div
      key={lang}
      className={`element-${item.index} ${className} border border-black max-w-[800px] h-auto -mt-1`}
    >
      <PanelBodyRoot item={item} />
      <PanelActions
        item={item}
        renderSaveButton={() => (
          <ModalButton isOpenButton={false}>
            {modals[item.index] && (
              <Button
                className="mr-4"
                onClick={handleSubmit({ item, properties: modals[item.index] })}
              >
                {t("save")}
              </Button>
            )}
          </ModalButton>
        )}
      >
        {!isRichText && modals[item.index] && (
          <ModalForm
            item={item}
            properties={modals[item.index]}
            updateModalProperties={updateModalProperties}
            unsetModalField={unsetModalField}
          />
        )}
      </PanelActions>
    </div>
  );
};
