import { useState, useCallback, useRef } from "react";

// isHovered modified from:
// https://gist.github.com/mbelsky/72c1117a63489daf8e6067049d4532d0
// https://gist.github.com/gragland/a32d08580b7e0604ff02cb069826ca2f?permalink_comment_id=3226761#gistcomment-3226761

export const useHover = <T extends HTMLElement>(): [(node?: T | null) => void, boolean] => {
  const [value, setValue] = useState(false);

  // Wrap in useCallback so we can use in dependencies below
  const handleMouseEnter = useCallback(() => setValue(true), []);
  const handleMouseLeave = useCallback(() => setValue(false), []);

  // Keep track of the last node passed to callbackRef
  // so we can remove its event listeners.
  const ref = useRef<T>();

  // Use a callback ref instead of useEffect so that event listeners
  // get changed in the case that the returned ref gets added to
  // a different element later. With useEffect, changes to ref.current
  // wouldn't cause a rerender and thus the effect would run again.
  const callbackRef = useCallback<(node?: null | T) => void>(
    (node) => {
      if (ref && ref.current) {
        ref.current.removeEventListener("mouseenter", handleMouseEnter);
        ref.current.removeEventListener("mouseleave", handleMouseLeave);
      }

      ref.current = node || undefined;

      if (ref.current) {
        ref.current.addEventListener("mouseenter", handleMouseEnter);
        ref.current.addEventListener("mouseleave", handleMouseLeave);
      }
    },
    [handleMouseEnter, handleMouseLeave]
  );

  return [callbackRef, value];
};
