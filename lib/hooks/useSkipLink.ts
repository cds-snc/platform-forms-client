import { useEffect } from "react";

/**
 * Sets the first h1 in a page to allow being focussed from SkipLink. This alows a user to "skip"
 * to the main content - a win for AT users.
 */
export const useSkipLink = () => {
  useEffect(() => {
    const els = document.getElementsByTagName("h1");
    const h1 = els && els[0];

    if (h1) {
      h1.setAttribute("tabindex", "-1");
      // Leave any existing id just encase changing it would break functionality
      if (!h1.getAttribute("id")) {
        // Used by SkipLink as the target anchor
        h1.setAttribute("id", "main-header");
      }
    }
  }, []);
};
