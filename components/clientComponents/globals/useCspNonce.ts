"use client";

import { useState } from "react";

export function useCspNonce() {
  const [nonce] = useState<string | null>(() => {
    try {
      if (typeof document === "undefined") return null;
      const meta = document.querySelector('meta[name="csp-nonce"]');
      return (meta && meta.getAttribute("content")) || null;
    } catch (e) {
      return null;
    }
  });

  return nonce;
}
