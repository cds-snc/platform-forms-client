export const getBrowserInfo = () => {
  if (typeof window === "undefined") return null;

  const userAgent = navigator.userAgent;

  // Basic browser detection
  const isChrome = /Chrome/.test(userAgent) && /Google Inc/.test(navigator.vendor || "");
  const isFirefox = /Firefox/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && /Apple Computer/.test(navigator.vendor || "");
  const isEdge = /Edg/.test(userAgent);

  return {
    browser: isChrome
      ? "Chrome"
      : isFirefox
        ? "Firefox"
        : isSafari
          ? "Safari"
          : isEdge
            ? "Edge"
            : "Unknown",
    userAgent,
    hasFileSystemAccess: !!window.showDirectoryPicker,
  };
};
