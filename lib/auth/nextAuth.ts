import CredentialsProvider from "next-auth/providers/credentials";
import ZitadelProvider from "next-auth/providers/zitadel";
import NextAuth, { CredentialsSignin, Session } from "next-auth";
import { validate2FAVerificationCode, userHasSecurityQuestions } from "@lib/auth/";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { getOrCreateUser } from "@lib/users";
import { prisma } from "@lib/integration/prismaConnector";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import { activeStatusCheck, activeStatusUpdate } from "@lib/cache/userActiveStatus";
import { JWT } from "next-auth/jwt";

import { Issuer } from "openid-client";

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    const issuer = await Issuer.discover(process.env.ZITADEL_ISSUER ?? "");
    const client = new issuer.Client({
      client_id: process.env.ZITADEL_CLIENT_ID || "",
      token_endpoint_auth_method: "none",
    });

    const { refresh_token, access_token, expires_at } = await client.refresh(
      token.refreshToken as string
    );

    return {
      ...token,
      accessToken: access_token,
      expiresAt: (expires_at ?? 0) * 1000,
      refreshToken: refresh_token, // Fall back to old refresh token
    };
  } catch (error) {
    logMessage.error("Error during refreshAccessToken", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

/**
 * Checks the active status of a user using a cache strategy
 * @param userID id of the user to check
 * @returns boolean active status
 */
const checkUserActiveStatus = async (userID: string): Promise<boolean> => {
  // Check cache first
  const cachedStatus = await activeStatusCheck(userID);
  if (cachedStatus !== null) {
    return cachedStatus;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userID,
    },
    select: {
      active: true,
    },
  });

  // Update cache with new value
  // Do not need to await promise.  This is an update only action that on fail will
  // force a recheck of the database on next call
  activeStatusUpdate(userID, user?.active ?? false);

  return user?.active ?? false;
};

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    ZitadelProvider({
      issuer: process.env.ZITADEL_ISSUER,
      clientId: process.env.ZITADEL_CLIENT_ID,
      checks: ["pkce"],
      client: {
        token_endpoint_auth_method: "none",
      },
      async profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
    }),
    CredentialsProvider({
      id: "mfa",
      name: "MultiFactorAuth",
      credentials: {
        authenticationFlowToken: { label: "Authentication flow token", type: "text" },
        username: { label: "Username", type: "text" },
        verificationCode: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        const { authenticationFlowToken, username, verificationCode } = credentials ?? {};

        // Check to ensure all required credentials were passed in
        if (
          typeof authenticationFlowToken !== "string" ||
          typeof username !== "string" ||
          typeof verificationCode !== "string"
        ) {
          return null;
        }

        // Check for test accounts being used
        if (
          [
            "test.user@cds-snc.ca",
            "test.admin@cds-snc.ca",
            "test.deactivated@cds-snc.ca",
            "test.withoutsecurityanswers@cds-snc.ca",
          ].includes(username)
        ) {
          // If we're not in test mode throw an error
          if (process.env.APP_ENV !== "test") {
            logMessage.error(`Test account ${username} was used in a non-testing environment.`);
            throw new Error("Test accounts misuse");
          }

          return {
            // id is not used by the app, but is required by next-auth
            id: "test",
            email: username,
          };
        }

        const { valid, decodedCognitoToken } = await validate2FAVerificationCode(
          authenticationFlowToken,
          username,
          verificationCode
        );

        if (valid) {
          if (!decodedCognitoToken) {
            logMessage.error("Missing decoded Cognito token in 2FA validation result");
            throw new Error("2FA validation");
          }
          return decodedCognitoToken;
        }
        return null;
      },
    }),
  ],
  // When building the app use a random UUID as the token secret
  secret: process.env.TOKEN_SECRET ?? crypto.randomUUID(),
  session: {
    strategy: "jwt",
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 2 * 60 * 60, // 2 hours
    updateAge: 30 * 60, // 30 minutes
  },
  // Only trust the host if we don't explicitly have a AUTH_URL set
  trustHost: process.env.AUTH_URL ? false : true,
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(error) {
      if (error instanceof CredentialsSignin) {
        logMessage.warn(`NextAuth - CredentialsSignin exception: ${JSON.stringify(error)}.`);
      } else {
        logMessage.error(`NextAuth error: ${JSON.stringify(error)}.`);
      }
    },
    warn(code) {
      logMessage.warn(`NextAuth warning - Code: ${code}`);
    },
  },

  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user }) {
      if (!user.email) {
        logMessage.error(
          "Could not produce UserSignIn audit log because of undefined email information"
        );
        return;
      }

      const internalUser = await prisma.user.findUnique({
        where: {
          email: user.email,
        },
        select: {
          id: true,
        },
      });

      if (internalUser === null) {
        logMessage.error("Could not produce UserSignIn audit log because user does not exist");
        return;
      }

      logEvent(
        internalUser.id,
        { type: "User", id: internalUser.id },
        "UserSignIn",
        `Cognito user unique identifier (sub): ${user.id}`
      );
    },
    async signOut(obj) {
      if ("token" in obj && obj.token !== null) {
        // Token will always be availabe because we leverage JWT for session management
        const userId = (obj.token as JWT).userId ?? "Unknown User ID";
        logEvent(userId, { type: "User", id: userId }, "UserSignOut");
      }
    },
  },

  callbacks: {
    async jwt({ token, account, trigger, session }) {
      // account is only available on the first call to the JWT function
      if (account?.provider) {
        if (!token.email) {
          logMessage.error(`JWT token does not have an email for user with name ${token.name}`);
          throw new Error(`JWT token`);
        }
        const user = await getOrCreateUser(token);
        if (user === null) {
          logMessage.error(`Could not get or create user with email: ${token.email}`);
          throw new Error(`Invalid user`);
        }

        token.userId = user.id;
        token.lastLoginTime = new Date();
        token.newlyRegistered = user.newlyRegistered;
        // If name isn't passed in by the provider, use the name from the database
        if (!token.name) {
          token.name = user.name ?? "";
        }
      }

      // Client side session update (e.g. when a user has accepted the Acceptable Use Policy)
      // Only permit the updating of certain properties

      if (trigger === "update" && session) {
        logMessage.debug(`Client Side Session update recieved for user ${token.email}`);
        token = {
          ...token,
          acceptableUse: session.user.acceptableUse,
        };
      }

      // Any logic that needs to happen after JWT initializtion needs to be below this point.

      // Check if user has setup required Security Questions
      if (!token.hasSecurityQuestions) {
        token.hasSecurityQuestions = await userHasSecurityQuestions({ userId: token.userId });
      }

      token.accessToken ??= account?.access_token;
      token.refreshToken ??= account?.refresh_token;
      token.expiresAt ??= (account?.expires_at ?? 0) * 1000;
      token.error = undefined;

      // Check if user has been deactivated
      const userActive = await checkUserActiveStatus(token.userId ?? "");
      if (!userActive) {
        // Client side auth lib will use this to immediately log out a user if they have been deactivated
        // Server side API calls will be caught in sessionExists middleware
        logMessage.warn(
          `User ${token.userId} (${token.email}) was Deactivated during an active session`
        );
        token.deactivated = true;
      }
      // Return previous token if the access token has not expired yet
      if (Date.now() < (token.expiresAt as number)) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
    async session(params) {
      const { session, token } = params as { session: Session; token: JWT };
      // Add info like 'role' to session object
      session.user = {
        id: token.userId ?? "",
        lastLoginTime: token.lastLoginTime,
        acceptableUse: token.acceptableUse ?? false,
        name: token.name ?? null,
        email: token.email,
        privileges: await getPrivilegeRulesForUser(token.userId as string),
        ...(token.newlyRegistered && { newlyRegistered: token.newlyRegistered }),
        // Used client side to immidiately log out a user if they have been deactivated
        ...(token.deactivated && { deactivated: token.deactivated }),
        hasSecurityQuestions: token.hasSecurityQuestions ?? false,
      };
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
});
