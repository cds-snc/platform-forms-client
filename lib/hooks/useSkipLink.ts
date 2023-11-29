import { useEffect } from "react";

// TODO: ideally each H1 would manually have the id="main-header" but that could take some work 
// given many H1's are dynamic shown/hidden/updated. When refactoring consider doing that and 
// deleting this.

/**
 * This alows a user to "skip" to the main content - a win for AT users.
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
