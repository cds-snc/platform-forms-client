"use client";

import { useEffect } from "react";

type FederatedLogoutProps = {
  endSessionEndpoint: string;
  returnTo: string;
  onceKey: string;
  clientId?: string;
};

export const FederatedLogout = ({
  endSessionEndpoint,
  returnTo,
  onceKey,
  clientId,
}: FederatedLogoutProps) => {
  useEffect(() => {
    const storageKey = `oidc-federated-logout:${onceKey}`;
    const hasRedirected = window.sessionStorage.getItem(storageKey) === "1";
    if (hasRedirected) {
      window.sessionStorage.removeItem(storageKey);
      return;
    }

    window.sessionStorage.setItem(storageKey, "1");

    const url = new URL(endSessionEndpoint);
    const returnToUrl = new URL(returnTo, window.location.origin).toString();
    url.searchParams.set("post_logout_redirect_uri", returnToUrl);
    if (clientId) {
      url.searchParams.set("client_id", clientId);
    }
    window.location.replace(url.toString());
  }, [clientId, endSessionEndpoint, onceKey, returnTo]);

  return null;
};
