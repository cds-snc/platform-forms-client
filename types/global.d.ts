import "react";
interface Window {
  dataLayer: Array<unknown>;
}

declare module "react" {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Adds support for Declarative Shadow DOM template attributes
    shadowrootmode?: "open" | "closed";
    shadowrootdelegatesfocus?: boolean;
    shadowrootclonable?: boolean;
  }
}
