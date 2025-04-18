import * as React from "react";
import { disableBodyScroll, enableBodyScroll } from "body-scroll-lock";

function usePreventScroll(enabled: boolean, contentWrapperClass: string) {
  React.useLayoutEffect(() => {
    if (typeof document === "undefined" || !enabled) {
      return;
    }

    const scrollableElement = document.querySelector(`.${contentWrapperClass}`);

    if (scrollableElement) {
      disableBodyScroll(scrollableElement);
    }

    return () => {
      if (scrollableElement) {
        enableBodyScroll(scrollableElement);
      }
    };
  }, [contentWrapperClass, enabled]);
}

export default usePreventScroll;
