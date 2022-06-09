import Document, { Html, Head, Main, NextScript } from "next/document";
import React from "react";
import { googleTagManager, cspHashOf } from "@lib/cspScripts";
import BrowserIncompatibility from "./browser-incompatibility";

let scriptHashes = [];
let externalScripts = [];

function getCsp() {
  let csp = ``;
  csp += `object-src 'none';`;
  csp += `base-uri 'self';`;
  csp += `form-action 'self';`;
  csp += `default-src 'self';`;
  csp += `script-src 'self' 'strict-dynamic' ${scriptHashes.join(" ")} ${
    process.env.ISOLATED_INSTANCE ? "'unsafe-eval'" : ""
  } 'unsafe-inline' https:;`;
  csp += `style-src 'self' fonts.googleapis.com 'unsafe-inline' data:;`;
  csp += `img-src 'self' https: data:;`;
  csp += `font-src 'self' fonts.gstatic.com;`;
  csp += `frame-src www.googletagmanager.com www.google.com/recaptcha/ recaptcha.google.com/recaptcha/;`;
  csp += `connect-src 'self' www.googletagmanager.com www.google-analytics.com`;
  return csp;
}

const GoogleTagScript = React.createElement("script", {
  defer: true,
  dangerouslySetInnerHTML: {
    __html: googleTagManager,
  },
});

class StrictStaticCSP extends Head {
  constructor() {
    super();
  }

  getExternalScripts() {
    // get <script>'s that are declared as children in Head but are not inline scripts
    const scriptProps = [];
    React.Children.forEach(this.props?.children, (child) => {
      if (child?.type === "script" && child?.props?.src) {
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
    // get all scripts generated by NextJS for client side interactivity
    const scripts = super.getScripts(files);

    if (scripts.length > 0) {
      return scripts.map((script) => {
        const { src, async, crossOrigin = "", defer = "", nonce = "" } = script.props;
        return { src, async, crossOrigin, defer, nonce };
      });
    } else {
      return [];
    }
  }

  getScripts(files) {
    // gather all scripts and create a loader script that has a hash computed.
    // CSP allows for a hashed verified script to load additional scripts.
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
    // Don't add the hashes again if they already exist in the array
    this.addHashes(cspHashOf(nextJsSPA));
    this.addHashes(cspHashOf(googleTagManager));

    // return an empty array so NextJS doesn't duplicate the addition of the scripts to Head.
    return [];
  }

  addHashes(hash) {
    if (!scriptHashes.includes(hash)) {
      scriptHashes.push(hash);
    }
  }

  render() {
    const _head = super.render();

    const cspPolicy = React.createElement("meta", {
      key: "CSP_NEXT_",
      httpEquiv: "Content-Security-Policy",
      content: `${getCsp()}`,
    });

    // Remove original external script declarations so they aren't duplicated
    // by the loader script.
    const pruneHead = (node) => {
      return React.Children.map(node, (child) => {
        if (child?.type === "script" && externalScripts.includes(child.props?.src)) {
          return;
        } else if (child?.props?.children) {
          return React.cloneElement(child, { key: child.props?.key }, [
            ...pruneHead(child.props.children),
          ]);
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
    // Get the current host url so we can see if we're in Prod.
    const currentUrl = ctx.req?.headers?.host;

    return { ...initialProps, currentUrl };
  }

  render() {
    return (
      <Html>
        <CustomHead>
          <script async type="text/javascript" src="/static/scripts/form-polyfills.js"></script>
          {this.props.currentUrl === "forms-formulaires.alpha.canada.ca" && GoogleTagScript}
        </CustomHead>
        <body>
          {this.props.currentUrl === "forms-formulaires.alpha.canada.ca" && (
            <noscript>
              <iframe
                src="https://www.googletagmanager.com/ns.html?id=GTM-W3ZVVX5"
                title="Google Tag Manager Iframe Window"
                height="0"
                width="0"
                style={{ display: "none", visibility: "hidden" }}
              ></iframe>
            </noscript>
          )}
          <noscript>
            <BrowserIncompatibility />
          </noscript>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
