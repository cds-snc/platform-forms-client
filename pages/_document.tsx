import Document, { Html, Head, Main, NextScript, OriginProps } from "next/document";
import React from "react";
import { googleTagManager, cspHashOf } from "@lib/cspScripts";

const scriptHashes: Array<string> = [];
const externalScripts: Array<string> = [];

function getCsp() {
  let csp = ``;
  csp += `object-src 'none';`;
  csp += `base-uri 'self';`;
  csp += `form-action 'self';`;
  csp += `default-src 'self';`;
  csp += `script-src 'self' 'strict-dynamic' ${scriptHashes.map((hash) => `'${hash}'`).join(" ")} ${
    process.env.APP_ENV === "test" ? "'unsafe-eval'" : ""
  } 'unsafe-inline' https:;`;
  csp += `style-src 'self' 'unsafe-inline' data:;`;
  csp += `img-src 'self';`;
  csp += `font-src 'self';`;
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
  constructor(
    args:
      | (OriginProps &
          React.ClassAttributes<HTMLHeadElement> &
          React.HTMLAttributes<HTMLHeadElement>)
      | Readonly<
          OriginProps &
            React.ClassAttributes<HTMLHeadElement> &
            React.HTMLAttributes<HTMLHeadElement>
        >
  ) {
    super(args);
  }

  getExternalScripts() {
    // get <script>'s that are declared as children in Head but are not inline scripts
    const scriptProps: Array<Record<string, unknown>> = [];
    React.Children.forEach(this.props?.children, (child) => {
      if (React.isValidElement(child) && child.type === "script" && child.props.src) {
        scriptProps.push({
          src: child.props.src,
          async: true,
          crossOrigin: child.props.crossOrigin,
          defer: false,
          nonce: child.props.nonce,
        });
        !externalScripts.includes(child.props.src) && externalScripts.push(child.props.src);
      } else {
        return child;
      }
    });
    return scriptProps;
  }
  getInternalScripts(files: {
    sharedFiles: readonly string[];
    pageFiles: readonly string[];
    allFiles: readonly string[];
  }) {
    // get all scripts generated by NextJS for client side interactivity
    const scripts = super.getScripts(files);

    if (scripts.length > 0) {
      return scripts.map((script) => {
        const { src, crossOrigin = "", nonce = "" } = script.props;
        return { src, async: false, crossOrigin, defer: true, nonce };
      });
    } else {
      return [];
    }
  }

  getScripts(files: {
    sharedFiles: readonly string[];
    pageFiles: readonly string[];
    allFiles: readonly string[];
  }) {
    // gather all scripts and create a loader script that has a hash computed.
    // CSP allows for a hashed verified script to load additional scripts.
    const scriptProps: Array<unknown> = [];
    scriptProps.push(...this.getInternalScripts(files));
    scriptProps.push(...this.getExternalScripts());
    const nextJsSPA = `'use strict';
    function deferJS() {
      var scripts = ${JSON.stringify(scriptProps)}
      scripts.forEach(function(script) {
        var s = document.createElement('script')
        s.src = script.src
        s.async = script.async
        s.defer = script.defer
        s.nonce = script.nonce
         document.head.appendChild(s)
      });
    }

    function selfDestruct() {
        var script = document.currentScript || document.scripts[document.scripts.length - 1];
        script.parentNode.removeChild(script);
    }

    // call deferJS when DOMContentLoaded is fired:
    if (window.addEventListener) {
        window.addEventListener('DOMContentLoaded', deferJS, false);
    } else if (document.onreadystatechange) {
        document.onreadystatechange = function () {
            if (document.readyState === 'interactive') {
                deferJS();
            }
        };
    } else {
        window.onload = deferJS;
    }

    // lastly, remove this script:
    selfDestruct();`;
    const nextJsSPAScript = React.createElement("script", {
      async: true,
      defer: false,
      crossOrigin: "anonymous",
      integrity: cspHashOf(nextJsSPA),
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

  addHashes(hash: string) {
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
    const pruneScripts = (node: React.ReactNode): React.ReactNode => {
      // If node is an array drill down and repeat
      if (Array.isArray(node)) {
        return node
          .map((child): React.ReactNode => {
            return pruneScripts(child);
          })
          .filter((val: React.ReactNode) => typeof val !== "undefined" && val !== null);
      }

      if (React.isValidElement(node)) {
        if (node.type === "script" && externalScripts.includes(node.props.src)) {
          // Drop the child node as it's already included
          return;
        } else if (node.props.children) {
          if (Array.isArray(node.props.children)) {
            React.cloneElement(node, { key: node.props.key }, [
              ...node.props.children
                .map((child: React.ReactNode): React.ReactNode => {
                  return pruneScripts(child);
                })
                .filter((val: React.ReactNode) => typeof val !== "undefined" && val !== null),
            ]);
          } else {
            React.cloneElement(node, { key: node.props.key }, [pruneScripts(node.props.children)]);
          }
        }
      }
      return node;
    };
    const pruneHead = (node: React.ReactNode) => {
      const pruned = pruneScripts(node);
      if (Array.isArray(pruned)) {
        return pruned;
      } else {
        return [pruned];
      }
    };

    return React.cloneElement(_head, { key: _head.props.key }, [
      cspPolicy,
      ...pruneHead(_head.props.children),
    ]);
  }
}

// Actual main Document being rendered

const CustomHead = process.env.NODE_ENV === "production" ? StrictStaticCSP : Head;

const NoIndexMetaTag =
  process.env.INDEX_SITE === "true" ? null : (
    <>
      {/* The msvalidate.01 meta tag is used to verify ownership of the website for Bing in order to get the staging URL out of search results.*/}
      <meta name="msvalidate.01" content="90CA81AA34C5B1B1F53A42906A93992A" />
      <meta name="robots" content="noindex,nofollow" />
    </>
  );

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <CustomHead>
          {NoIndexMetaTag}
          <script async type="text/javascript" src="/static/scripts/form-polyfills.js"></script>
          {GoogleTagScript}
        </CustomHead>
        <noscript>
          <style type="text/css">{`#__next {display:none;}`}</style>
          <meta httpEquiv="Refresh" content="0; url='/javascript-disabled.html'" />
        </noscript>
        <body>
          {/* Will only run if Browser does not have JS enabled */}
          <noscript>
            <iframe
              src="https://www.googletagmanager.com/ns.html?id=GTM-W3ZVVX5"
              title="Google Tag Manager Iframe Window"
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            ></iframe>
          </noscript>

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
