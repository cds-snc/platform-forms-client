import { useCallback } from "react";

/**
 * Utility function to focus an element on load. This helps manage the users focus
 *
 * @example
 * // Focus the heading element when "loaded" by assigning a React ref to it
 * const headingRef = useFocusIt();
 * ...
 * <h1 ref={headingRef}>My Headding</h1>
 *
 * @param addTabindIndex Whether to add a tab-index attribute. If true (default), a
 *    `tab-index=-1` attribute is is automatically added to the element if none exist.
 */
export const useFocusIt = (addTabindIndex = true) => {
  return useCallback((el: HTMLElement) => {
    if (el) {
      // Add a tabindex if one doesn't exist on the element. This is needed to focus an element,
      // unless it is a form control like an input or button but doesn't "hurt" to have regardless.
      if (addTabindIndex && !el.getAttribute("tabIndex")) {
        el.setAttribute("tabIndex", "-1");
      }

      // Give the DOM a little time to update
      setTimeout(() => {
        el?.focus();
      }, 40);
    }
  }, []);
};
