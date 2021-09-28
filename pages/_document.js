import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";
import crypto from "crypto";

//import { useFlag } from "../lib/hooks/flags";

function getCsp() {
  let csp = ``;
  csp += `base-uri 'self';`;
  csp += `form-action 'self';`;
  csp += `default-src 'self';`;
  csp += `style-src 'self' fonts.googleapis.com data:;`;
  csp += `img-src 'self' https: data:;`;
  csp += `font-src 'self' fonts.gstatic.com;`;
  csp += `frame-src www.googletagmanager.com;`;
  return csp;
}

const googleTagManagerScript = `
                <!-- Google Tag Manager -->
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-W3ZVVX5');
                <!-- End Google Tag Manager -->
              `;

// NextStrictCSP.inlineJs = [googleTagManagerScript];
//const HeadCSP = process.env.NODE_ENV !== "production" ? StrictStaticCSP : Head;

const cspHashOf = (text) => {
  const hash = crypto.createHash("sha256");
  hash.update(text);
  return `'sha256-${hash.digest("base64")}'`;
};
let inlineJs = [];
let inlineJsHashed = [];
let sourceJsFiles = [];

class StrictStaticCSP extends Head {
  constructor() {
    super();
  }
  getDynamicChunks(files) {
    const { dynamicImports } = this.context;
    sourceJsFiles = dynamicImports
      .filter((file) => /\.js$/.test(file))
      .map((jsFile) => {
        return `'/_next/${encodeURI(jsFile)}'`;
      });
    return super.getDynamicChunks(files);
  }

  getScripts(files) {
    const { allFiles } = files;
    const jsFiles = allFiles
      .filter((file) => /\.js$/.test(file))
      .map((jsFile) => {
        return `'/_next/${encodeURI(jsFile)}'`;
      });
    const { buildManifest, __NEXT_DATA__ } = this.context;
    const { lowPriorityFiles } = buildManifest;
    const jsFiles2 = lowPriorityFiles.map((jsFile) => {
      return `'/_next/${encodeURI(jsFile)}'`;
    });
    const jsFiles3 = jsFiles.concat(jsFiles2);
    const nextJsFiles = sourceJsFiles.concat(jsFiles3);
    const nextJsSPA = `var scripts = [${nextJsFiles.join()}]
    scripts.forEach(function(scriptUrl) {
      var s = document.createElement('script')
      s.src = scriptUrl
      s.async = false // to preserve execution order
      s.defer = true
      document.head.appendChild(s)
    })`;
    const nextJsSPAScript = React.createElement("script", {
      defer: true,
      dangerouslySetInnerHTML: {
        __html: nextJsSPA,
      },
    });
    inlineJsHashed = inlineJs.map((inlineJs) => {
      return cspHashOf(inlineJs);
    });

    const cspPolicy = React.createElement("meta", {
      httpEquiv: "Content-Security-Policy",
      content: `${getCsp()} script-src 'strict-dynamic' ${cspHashOf(
        nextJsSPA
      )} ${inlineJsHashed.join(" ")} 'unsafe-inline' http: https:;`,
      slug: __NEXT_DATA__.page,
    });
    this.context.headTags.unshift(cspPolicy);
    this.context.headTags.push(nextJsSPAScript);

    return super.getScripts(files);
  }
}

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    //const googleTag = useFlag("googleAnalytics");
    return { ...initialProps, googleTag: false };
  }

  render() {
    return (
      <Html>
        <StrictStaticCSP>
          {this.googleTag && (
            <React.Fragment>
              <script
                dangerouslySetInnerHTML={{
                  __html: googleTagManagerScript,
                }}
              />
            </React.Fragment>
          )}
          <script async type="text/javascript" src="/static/scripts/form-polyfills.js"></script>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
          <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" sizes="32x32" />
          <link rel="preconnect" href="https://fonts.gstatic.com/" crossOrigin="" />
          {
            // eslint-disable-next-line @next/next/google-font-display
            <link
              href="https://fonts.googleapis.com/css?family=Lato:400,700%7CNoto+Sans:400,700&amp;display=fallback"
              rel="stylesheet"
            />
          }
        </StrictStaticCSP>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
