import crypto from "crypto";

const prodGTM = "GTM-W3ZVVX5";
const devGTM = "GTM-KNMJRS8";
// Values are currently hardcoded because nextjs and CSP and GTM don't play well together
export const googleTagManager = `'use strict';
function selfDestruct() {
  var script = document.currentScript || document.scripts[document.scripts.length - 1];
  script.parentNode.removeChild(script);
}
if (window.location.host === "forms-formulaires.alpha.canada.ca") {
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${prodGTM}')
} else if (window.location.host.startsWith("localhost")) {
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
  })(window,document,'script','dataLayer','${devGTM}')
} else {
  // Remove script from DOM as it's not needed
  selfDestruct();
}
`;

export const cspHashOf = (text: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(text);
  return `sha256-${hash.digest("base64")}`;
};
