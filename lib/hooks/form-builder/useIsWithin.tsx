"use client";
import { useEffect, useState } from "react";
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

  // Add event listener for a custom close-all-panel-menus event
  // This fixes an issue where the panel menu would still be open
  // after adding and focusing on a new element
  useEffect(() => {
    window &&
      window.addEventListener("close-all-panel-menus", () => {
        setFocusWithin(false);
      });

    return () => {
      window.removeEventListener("close-all-panel-menus", () => {
        setFocusWithin(false);
      });
    };
  }, []);

  const isWithin = isFocusWithin ? true : false;

  return { focusWithinProps, isWithin };
};
