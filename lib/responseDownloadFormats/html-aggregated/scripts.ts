import React from "react";
import { customTranslate } from "../helpers";

// Note this depends on clipboardjs in ../html/scripts.js
export const copyCodeAndResponseFromTableToClipboardScript = function (lang = "en") {
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

            // Copy Row Response From Table
            var btnCopyResponse = document.getElementById("copyResponseButton${capitalizedLang}");
            var outputCopyResponse = document.getElementById("copyResponseOutput${capitalizedLang}");
            var responseItems = Array.from(document.querySelectorAll("#responseTableRow${capitalizedLang} tr"));
            // Format with tab separators for Excel copy+paste
            var responseText = responseItems.map(item => {
              var text = item.textContent;
              // This is needed for Excell that relies on tabs or multiple spaces to delimit a new cell
              // and should replace any user content that may accidentally start a new cell.
              // Replace 1 or more tabs or newlines with nothing, and two or more spaces with nothing.
              return text.replace(/[\\t|\\n]{1,}|[ ]{2,}/g, "");
            }).join(String.fromCharCode(9));
            btnCopyResponse.dataset.clipboardText = responseText;
            var clipboardResponse = new ClipboardJS("#copyResponseButton${capitalizedLang}");
            clipboardResponse.on('success', function (e) {
              outputCopyResponse.classList.remove("hidden");
              outputCopyResponse.textContent = "${t("responseTemplate.copiedToCipboard", {
                lng: lang || "en",
              })}";
              e.clearSelection();
            });
            clipboardResponse.on('error', function () {
              outputCopyResponse.classList.remove("hidden");
              outputCopyResponse.classList.add("text-red-default");
              outputCopyResponse.textContent = "${t("responseTemplate.errorrCopyingToClipboard", {
                lng: lang || "en",
              })}";
            });
          });
      `,
    },
  });

  return scriptAsHTML;
};
