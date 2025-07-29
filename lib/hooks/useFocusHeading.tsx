import { RefObject } from "react";
import { useEffect } from "react";
import { focusHeading } from "../client/clientHelpers";

// Util to focus a React heading element on load or "page" update
export const useFocusHeading = (headingRef: RefObject<HTMLHeadingElement | null>) => {
  useEffect(() => {
    if (!headingRef || !headingRef.current) {
      return;
    }
    focusHeading(headingRef.current);
  }, [headingRef]);
};
