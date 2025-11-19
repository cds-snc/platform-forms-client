import React from "react";
import { customTranslate } from "../../i18nHelpers";

// Note: this depends on clipboardjs in ../html/scripts.js
export const copyCodeToClipboardScript = function (lang = "en") {
  const { t } = customTranslate("my-forms");

  const capitalizedLang = lang === "en" ? "En" : "Fr";

  const scriptAsHTML = React.createElement("script", {
    dangerouslySetInnerHTML: {
      __html: `
        document.addEventListener("DOMContentLoaded", function() {
          // Copy Code
          var btnCopyCode = document.getElementById("copyCodeButton${capitalizedLang}");
          var outputCopyCode = document.getElementById("copyCodeOutput${capitalizedLang}");
          var clipboardCode = new ClipboardJS("#copyCodeButton${capitalizedLang}");
          clipboardCode.on('success', function (e) {
            outputCopyCode.classList.remove("hidden");
            outputCopyCode.textContent = "${t("responseTemplate.copiedToCipboard", {
              lng: lang || "en",
            })}";
            e.clearSelection();
          });
          clipboardCode.on('error', function () {
            outputCopyCode.classList.remove("hidden");
            outputCopyCode.classList.add("text-red-default");
            outputCopyCode.textContent = "${t("responseTemplate.errorrCopyingToClipboard", {
              lng: lang || "en",
            })}";
          });
        });
      `,
    },
  });

  return scriptAsHTML;
};
