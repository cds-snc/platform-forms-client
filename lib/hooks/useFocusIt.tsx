import { useEffect } from "react";

/**
 * Utility function to focus an element on load. This helps manage the users focus
 *
 * @example
 * // Focus a page heading on load and when stateVar changes
 * const headingRef = useRef(null);
 * useFocusIt({ elRef: headingRef, dependencies: [stateVar1, stateVar2] });
 * ...
 * <h1 ref={headingRef}>My Headding</h1>
 *
 * @param elRef React element to focus
 * @param addTabindIndex Whether to add a tab-index attribute. If true (default), a
 *    `tab-index=-1` attribute is is automatically added to the element if none exist.
 * @param dependencies array to watch and run focus again if any dependency changes
 */
export const useFocusIt = ({
  elRef,
  addTabindIndex = true,
  dependencies = [],
}: {
  elRef: React.MutableRefObject<null | HTMLElement>;
  addTabindIndex?: boolean;
  dependencies?: Array<unknown>;
}) => {
  useEffect(() => {
    const el = elRef.current;
    if (el) {
      // Add a tabindex if one does not exist on the element. This needed to focus an element,
      // unless it is a form control like an input or button
      if (addTabindIndex && !el.getAttribute("tabIndex")) {
        el.setAttribute("tabIndex", "-1");
      }

      // Give the DOM a little time to update
      setTimeout(() => {
        el?.focus();
      }, 40);
    }
    // eslint-disable-next-line
  }, [elRef, addTabindIndex, ...dependencies]);
};
