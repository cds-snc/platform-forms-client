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
  const nonce = crypto.randomUUID();
  let csp = ``;
  csp += `object-src 'none';`;
  csp += `base-uri 'self';`;
  csp += `form-action 'self';`;
  csp += `default-src 'self';`;
  csp += `script-src 'self' 'strict-dynamic' 'nonce-${nonce}' ${
    process.env.NODE_ENV === "production" ? "" : "'unsafe-eval'"
  } 'unsafe-inline' https:;`;
  csp += `style-src 'self' 'unsafe-inline' data:;`;
  csp += `img-src 'self';`;
  csp += `font-src 'self';`;
  csp += `frame-src www.googletagmanager.com www.google.com/recaptcha/ recaptcha.google.com/recaptcha/;`;
  csp += `connect-src 'self' www.googletagmanager.com www.google-analytics.com`;

  return { csp, nonce };
};

export const cspHashOf = (text: string): string => {
  const hash = crypto.createHash("sha256");
  hash.update(text);
  return `sha256-${hash.digest("base64")}`;
};
