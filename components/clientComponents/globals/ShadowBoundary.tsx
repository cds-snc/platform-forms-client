"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ShadowContainerProps {
  children: React.ReactNode;
}

export function ShadowContainer({ children }: ShadowContainerProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  useEffect(() => {
    if (hostRef.current && !hostRef.current.shadowRoot && !shadowRoot) {
      // Create the shadow root strictly on the client side
      const root = hostRef.current.attachShadow({ mode: "open" });
      fetch("/static/css/wp.css")
        .then((res) => res.text())
        .then((styles) => {
          const sheet = new CSSStyleSheet();
          sheet.replaceSync(styles);

          // 3. Adopt the sheet into the shadow root
          root.adoptedStyleSheets = [sheet];
        });

      setShadowRoot(root);
    }
  }, [shadowRoot]);

  return (
    <div ref={hostRef}>
      {/* 
        Render nothing on the server. 
        Once the shadow root is attached on the client, portal React children into it.
      */}
      {shadowRoot && createPortal(children, shadowRoot as unknown as Element)}
    </div>
  );
}
