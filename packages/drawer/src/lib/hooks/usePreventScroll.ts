import * as React from "react";
import {disableBodyScroll, enableBodyScroll} from "body-scroll-lock";

function usePreventScroll(enabled: boolean, contentWrapperClass: string) {
  React.useLayoutEffect(() => {
    if (typeof document === "undefined" || !enabled) {
      return;
    }
    
    const scrollableElement = document.querySelector(`.${contentWrapperClass}`);

    disableBodyScroll(scrollableElement);
    console.log("Disable body scrol");

    return () => {
      enableBodyScroll(scrollableElement);
    }
  }, [enabled]);
}

export default usePreventScroll;
