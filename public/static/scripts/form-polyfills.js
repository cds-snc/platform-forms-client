if (typeof window !== "undefined" && window.MSInputMethodContext && document.documentMode) {
  document.write('<script src="/static/scripts/polyfills/ie11CustomProperties.min.js"></script>');
  document.write('<script src="/static/scripts/polyfills/id_focus_within.min.js"></script>');
}
