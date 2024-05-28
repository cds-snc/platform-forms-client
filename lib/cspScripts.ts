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

export const generateCSP = (): { csp: string; nonce: string } => {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'nonce-${nonce}';
    img-src 'self' blob: data:;
    font-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-src www.googletagmanager.com;
    frame-ancestors 'none';
    connect-src 'self' www.googletagmanager.com www.google-analytics.com;
    block-all-mixed-content;
    upgrade-insecure-requests;
`;

  // replace newline characters with spaces
  return { csp: cspHeader.replace(/\s{2,}/g, " ").trim(), nonce };
};
