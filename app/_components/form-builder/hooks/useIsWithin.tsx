import { useState } from "react";
import { useFocusWithin } from "react-aria";

export const useIsWithin = () => {
  const [isFocusWithin, setFocusWithin] = useState(false);

  const { focusWithinProps } = useFocusWithin({
    onFocusWithinChange: (isFocusWithin) => {
      // ensure that the dialog is not open
      const dialogExists = document.querySelector("dialog");
      !dialogExists && setFocusWithin(isFocusWithin);
    },
  });

  const isWithin = isFocusWithin ? true : false;

  return { focusWithinProps, isWithin };
};
