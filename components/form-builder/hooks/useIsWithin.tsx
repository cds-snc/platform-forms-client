import { useState } from "react";
import { useFocusWithin } from "react-aria";

import { useHover } from "@formbuilder/hooks/useHover";

export const useIsWithin = () => {
  const [isFocusWithin, setFocusWithin] = useState(false);

  const [ref, isHovered] = useHover();

  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: (isFocusWithin) => setFocusWithin(isFocusWithin),
  });

  const isWithin = isFocusWithin || isHovered ? true : false;

  return { ref, focusWithinProps, isWithin };
};
