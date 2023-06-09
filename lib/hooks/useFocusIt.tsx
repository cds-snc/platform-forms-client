import { useEffect, useRef } from "react";

/**
 * Utility function to focus an element on load. This helps manage the users focus
 * e.g. on a page update, set the focus to the heading.
 *
 * @param elRef React element to focus
 * @param addTabindIndex Whether to add a tab-index attribute. If true (default), a
 *    `tab-index=-1` attribute is is automatically added to the element if none exist.
 */
export const useFocusIt = ({
  elRef,
  addTabindIndex = true,
}: {
  elRef: React.MutableRefObject<null | HTMLElement>;
  addTabindIndex?: boolean;
}) => {
  const wasFocussed = useRef(false);

  useEffect(() => {
    const el = elRef.current;
    if (el) {
      // Add a tabindex if not on the element - needed to focus an element (unless an for control)
      if (addTabindIndex && !el.getAttribute("tabIndex")) {
        el.setAttribute("tabIndex", "-1");
      }

      // Give the DOM a little time to update
      setTimeout(() => {
        // Encase the elRef updates N-times, only focus the el once
        if (!wasFocussed.current) {
          el?.focus();
          wasFocussed.current = true;
        }
      }, 40);
    }
  }, [elRef]);
};
