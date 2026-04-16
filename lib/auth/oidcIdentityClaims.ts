import { JWT } from "next-auth/jwt";

type IdentityClaims = {
  iss?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  email_verified?: boolean;
};

export const applyIdentityClaimsToToken = (token: JWT, claims?: IdentityClaims | null): JWT => {
  if (!claims) {
    return token;
  }

  if (claims.iss) {
    token.issuer = claims.iss;
    token.accountUrl = new URL("/ui/v2/account", claims.iss).toString();
  }

  if (
    typeof claims.given_name !== "undefined" ||
    typeof claims.family_name !== "undefined" ||
    typeof claims.preferred_username !== "undefined" ||
    typeof claims.email_verified !== "undefined"
  ) {
    token.profile = {
      givenName: claims.given_name,
      familyName: claims.family_name,
      preferredUsername: claims.preferred_username,
      emailVerified: claims.email_verified,
    };
  }

  return token;
};
