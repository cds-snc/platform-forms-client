import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";
import crypto from "crypto";

//import { useFlag } from "../lib/hooks/flags";
let scriptHashes = [];
let externalScripts = [];

function getCsp() {
  let csp = ``;
  csp += `object-src 'none';`;
  csp += `base-uri 'self';`;
  csp += `form-action 'self';`;
  csp += `default-src 'self';`;
  csp += `script-src 'self' 'strict-dynamic' ${scriptHashes.join(" ")} http: https:;`;
  csp += `style-src 'self' fonts.googleapis.com 'unsafe-inline' data:;`;
  csp += `img-src 'self' https: data:;`;
  csp += `font-src 'self' fonts.gstatic.com;`;
  csp += `frame-src www.googletagmanager.com;`;
  return csp;
}

const googleTagManager = `
                <!-- Google Tag Manager -->
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','GTM-W3ZVVX5');
                <!-- End Google Tag Manager -->
              `;

const GoogleTagScript = React.createElement("script", {
  defer: true,
  dangerouslySetInnerHTML: {
    __html: googleTagManager,
  },
});

const cspHashOf = (text) => {
  console.warn("Hashes being computed");
  const hash = crypto.createHash("sha256");
  hash.update(text);
  return `'sha256-${hash.digest("base64")}'`;
};

class StrictStaticCSP extends Head {
  constructor() {
    super();
  }

  getExternalScripts() {
    const scriptProps = [];
    React.Children.forEach(this.props?.children, (child) => {
      if (child?.type === "script") {
        scriptProps.push({
          src: child.props.src,
          async: true,
          crossOrigin: child?.props?.crossOrigin,
          defer: child?.props?.defer,
          nonce: child?.props?.nonce,
        });
        externalScripts.push(child.props.src);
      } else {
        return child;
      }
    });
    return scriptProps;
  }
  getInternalScripts(files) {
    const scripts = super.getScripts(files);

    return scripts.map((script) => {
      const { src, async, crossOrigin = "", defer = "", nonce = "" } = script?.props;
      return { src, async, crossOrigin, defer, nonce };
    });
  }

  getScripts(files) {
    const scriptProps = [];
    scriptProps.push(...this.getInternalScripts(files));
    scriptProps.push(...this.getExternalScripts());
    const nextJsSPA = `var scripts = ${JSON.stringify(scriptProps)}
    scripts.forEach(function(script) {
      var s = document.createElement('script')
      s.src = script.src
      s.async = script.async
      s.defer = script.defer
      s.nonce = script.nonce
       document.head.appendChild(s)
    })`;
    const nextJsSPAScript = React.createElement("script", {
      defer: true,
      dangerouslySetInnerHTML: {
        __html: nextJsSPA,
      },
    });
    this.context.headTags.push(nextJsSPAScript);
    scriptHashes.push(cspHashOf(nextJsSPA));
    scriptHashes.push(cspHashOf(googleTagManager));
    return [];
  }

  render() {
    const _head = super.render();

    const cspPolicy = React.createElement("meta", {
      key: "CSP_NEXT_",
      httpEquiv: "Content-Security-Policy",
      content: `${getCsp()}`,
    });

    // Remove original external script declarations
    const pruneHead = (node) => {
      return React.Children.map(node, (child) => {
        if (child?.type === "script" && externalScripts.includes(child.props?.src)) {
          return;
        } else if (child?.props?.children) {
          pruneHead(child.props.children);
        }
        return child;
      });
    };

    return React.cloneElement(_head, { key: _head.props.key }, [
      cspPolicy,
      ...pruneHead(_head.props.children),
    ]);
  }
}

// Actual main Document being rendered

const CustomHead = process.env.NODE_ENV === "production" ? StrictStaticCSP : Head;
class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    const currentUrl = ctx.req?.headers?.host;
    return { ...initialProps, currentUrl: currentUrl };
  }

  render() {
    return (
      <Html>
        <CustomHead>
          <script async type="text/javascript" src="/static/scripts/form-polyfills.js"></script>
          <link
            href="https://fonts.googleapis.com/css?family=Lato:400,700%7CNoto+Sans:400,700&amp;display=swap"
            rel="stylesheet"
          />
          {this.props.currentUrl !== "forms-formulaires.alpha.canada.ca" ? GoogleTagScript : null}
        </CustomHead>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
