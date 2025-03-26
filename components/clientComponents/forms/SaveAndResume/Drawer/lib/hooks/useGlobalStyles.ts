import React from "react";
import globalStylesheet, { getClassNames } from "../styles";

function useGlobalStyles(duration: number, hideScrollbars: boolean, nonce?: string) {
  const identifier = React.useMemo(() => Math.random().toString(36).substr(2), []);
  const classNames = React.useMemo(() => getClassNames(identifier), [identifier]);

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }
    const styles = globalStylesheet(identifier, { duration, hideScrollbars });

    const tag = document.createElement("style");
    tag.setAttribute("data-react-bottom-drawer", identifier);
    nonce && tag.setAttribute("nonce", nonce);
    tag.innerHTML = styles;

    document.head.appendChild(tag);

    return function () {
      const stylesheet = document.querySelector(`style[data-react-bottom-drawer='${identifier}']`);
      if (stylesheet) {
        stylesheet.remove();
      }
    };
  }, [duration, hideScrollbars, identifier, nonce]);

  return classNames;
}

export default useGlobalStyles;
