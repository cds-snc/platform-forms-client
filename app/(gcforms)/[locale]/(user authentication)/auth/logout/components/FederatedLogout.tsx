"use client";

import { useEffect } from "react";

type FederatedLogoutProps = {
  endSessionEndpoint: string;
  returnTo: string;
  onceKey: string;
  clientId?: string;
};

/*
 * This component handles federated logout for OIDC providers. It ensures that the user is redirected to the OIDC provider's end session endpoint with the appropriate parameters, and then back to the application after logout.
 */
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
    const oidcIdToken = window.sessionStorage.getItem("oidcIdToken");
    if (oidcIdToken) {
      url.searchParams.set("id_token_hint", oidcIdToken);
      window.sessionStorage.removeItem("oidcIdToken");
    }
    if (clientId) {
      url.searchParams.set("client_id", clientId);
    }
    window.location.replace(url.toString());
  }, [clientId, endSessionEndpoint, onceKey, returnTo]);

  return null;
};
