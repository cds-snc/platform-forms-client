// Temporary function to use the "unified sso auth" url without breaking API key generation or other code using the current "forms" Zitadel provider.
export const filterZitadelUrl = (url: string = ""): string => {
  // Handles case of https://auth.forms-staging.cdssandbox.xyz transforms to https://auth.cdssandbox.xyz
  return url.replace("auth.forms-staging.", "auth.");
};
