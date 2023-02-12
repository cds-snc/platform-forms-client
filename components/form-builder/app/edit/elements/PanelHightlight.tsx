import React, { useState } from "react";
import { useFocusWithin } from "react-aria";

import { useHover } from "@formbuilder/hooks/useHover";

export const PanelHightLight = ({ children }: { children: JSX.Element }) => {
  const [isFocusWithin, setFocusWithin] = useState(false);

  const [ref, isHovered] = useHover();

  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: (isFocusWithin) => setFocusWithin(isFocusWithin),
  });

  const hightLight = isFocusWithin || isHovered ? "bg-purple-100" : "";

  return (
    <div {...focusWithinProps} className={`px-5 py-1 ${hightLight} `} ref={ref}>
      {children}
    </div>
  );
};
