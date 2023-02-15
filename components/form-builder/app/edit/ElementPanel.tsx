import React, { useState, useEffect } from "react";

import { FormElementWithIndex } from "../../types";
import { useTemplateStore } from "../../store";
import { PanelActions, PanelBodyRoot, MoreModal } from "./index";

export const ElementPanel = ({ item }: { item: FormElementWithIndex }) => {
  const { lang, getFocusInput } = useTemplateStore((s) => ({
    lang: s.lang,
    elements: s.form.elements,
    getFocusInput: s.getFocusInput,
  }));

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

  return (
    <div
      key={lang}
      className={`element-${item.index} ${className} border border-black max-w-[800px] h-auto -mt-1`}
    >
      <PanelBodyRoot item={item} />
      <PanelActions
        item={item}
        renderMoreButton={({
          item,
          moreButton,
        }: {
          item: FormElementWithIndex;
          moreButton: JSX.Element | undefined;
        }) => <MoreModal item={item} moreButton={moreButton} />}
      />
    </div>
  );
};
