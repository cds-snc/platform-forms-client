if (window.MSInputMethodContext && document.documentMode) {
  console.log("Applying IE11 CSS polyfill");
  document.write(
    '<script src="https://cdn.jsdelivr.net/gh/nuxodin/ie11CustomProperties@4.1.0/ie11CustomProperties.min.js"></script>'
  );
}
