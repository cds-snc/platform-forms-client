import { useEffect } from "react";
/**
 * Adds an external script resource safely for CORS
 * @param url URL src of the external script to add
 * @param active Boolean value if script should be included or not.  Defaults to true.
 */
export const useExternalScript = (url: string, active = true): void => {
  useEffect(() => {
    if (!url || !active) {
      return;
    }
    let script: HTMLScriptElement | null = document.querySelector(`script[src="${url}"]`);

    if (!script) {
      script = document.createElement("script");
      script.type = "application/javascript";
      script.src = url;
      script.async = true;
      document.body.appendChild(script);
    }
    return () => {
      if (script) {
        script.remove();
      }
    };
  }, [url, active]);
};
