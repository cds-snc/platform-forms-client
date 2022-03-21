import { useEffect } from "react";
export const useExternalScript = (url: string, active = true): void => {
  useEffect(() => {
    // If the
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
