import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { CredentialsSignin, Session } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { userHasSecurityQuestions, validate2FAVerificationCode } from "@lib/auth/";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { getOrCreateUser } from "@lib/users";
import { prisma } from "@lib/integration/prismaConnector";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { getUserFeatureFlags } from "@lib/userFeatureFlags";
import { AuditLogDetails, logEvent } from "@lib/auditLogs";
import { activeStatusCheck, activeStatusUpdate } from "@lib/cache/userActiveStatus";
import { JWT } from "next-auth/jwt";
import { cache } from "react";
import { headers } from "next/headers";
import { checkOne } from "@lib/cache/flags";
import {
  sanitizeAdapterCreateUser,
  sanitizeAdapterUpdateUser,
} from "@lib/auth/adapterUserSanitizers";
import { applyIdentityClaimsToToken } from "@lib/auth/oidcIdentityClaims";

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

const prismaAdapter = PrismaAdapter(prisma);
const adapter = {
  ...prismaAdapter,
  async createUser(user: AdapterUser) {
    return prismaAdapter.createUser!(sanitizeAdapterCreateUser(user));
  },
  async updateUser(user: Partial<AdapterUser> & Pick<AdapterUser, "id">) {
    return prismaAdapter.updateUser!(sanitizeAdapterUpdateUser(user));
  },
};

const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  providers: [
    {
      id: "gcForms", // signIn("my-provider") and will be part of the callback URL
      name: "GC Forms", // optional, used on the default login page as the button text.
      type: "oidc",
      issuer: process.env.NEXT_PUBLIC_ZITADEL_URL,
      clientId: process.env.ZITADEL_CLIENT_ID,
      checks: ["pkce", "state"],
      client: { token_endpoint_auth_method: "none" },
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },

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
  // Elastic Load Balancer safely sets the host header and ignores the incoming request headers
  trustHost: true,
  logger: {
    error(error) {
      if (!(error instanceof CredentialsSignin)) {
        // Not a CredentialsSignin error which is for invalid 2FA credentials
        logMessage.error(`NextAuth error: ${JSON.stringify(error)}.`);
      }
    },
    warn(code) {
      logMessage.warn(`NextAuth warning - Code: ${code}`);
    },
    debug(code, ...message) {
      // TODO.. switch back to debug
      logMessage.info(code);
      logMessage.debug((message as string[]).join(" "));
    },
  },

  adapter,
  events: {
    async signIn({ user }) {
      logMessage.info(`User ${user.email} signed in ${JSON.stringify(user)}`);

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

      try {
        const requestHeaders = await headers();

        if (requestHeaders.get("x-amzn-waf-cognito-login-outside-of-canada")) {
          logMessage.info(
            `[next-auth][sign-in] User ${user.email} (${internalUser.id}) signed in from outside of Canada`
          );
        }
      } catch (error) {
        // headers() can fail during build time, log but don't prevent sign-in
        logMessage.debug(`Could not access request headers during sign-in event: ${error}`);
      }

      // Update lastLogin in the database
      if (user.email) {
        await prisma.user.update({
          where: { email: user.email },
          data: { lastLogin: new Date() },
        });
      }

      logEvent(
        internalUser.id,
        { type: "User", id: internalUser.id },
        "UserSignIn",
        AuditLogDetails.CognitoUserIdentifier,
        { userId: user.id ?? "" }
      );
    },
    async signOut(obj) {
      logMessage.info("=== sign out ===");
      logMessage.info(JSON.stringify(obj));

      if ("token" in obj && obj.token !== null) {
        // Token will always be availabe because we leverage JWT for session management
        const userId = (obj.token as JWT).userId ?? "Unknown User ID";
        logEvent(userId, { type: "User", id: userId }, "UserSignOut");
      }
    },
  },

  callbacks: {
    async jwt({ token, account, profile, trigger, session }) {
      // account is only available on the first call to the JWT function
      if (account?.provider) {
        if (account.provider === "gcForms") {
          const profileClaims = profile as
            | {
                iss?: string;
                given_name?: string;
                family_name?: string;
                preferred_username?: string;
                email_verified?: boolean;
              }
            | undefined;

          const oidcAccount = account as { id_token?: string };
          if (oidcAccount.id_token) {
            token.oidcIdToken = oidcAccount.id_token;
          }

          applyIdentityClaimsToToken(token, {
            iss: profileClaims?.iss,
            given_name: profileClaims?.given_name,
            family_name: profileClaims?.family_name,
            preferred_username: profileClaims?.preferred_username,
            email_verified: profileClaims?.email_verified,
          });
        }

        // If the GCForms SSO provider was used, but is not enabled, refuse the session
        const isZitadelLoginEnabled = await checkOne("zitadelLogin");
        if (!isZitadelLoginEnabled && account.provider === "gcForms") {
          throw new Error("Provider for GCForms SSO is not an active option");
        }

        if (!token.email) {
          logMessage.error(`JWT token does not have an email for user with name ${token.name}`);
          throw new Error(`JWT token`);
        }
        const internalUser = await getOrCreateUser(token);
        if (internalUser === null) {
          logMessage.error(`Could not get or create user with email: ${token.email}`);
          throw new Error(`Invalid user`);
        }

        token.userId = internalUser.id;
        token.lastLoginTime = new Date();
        token.newlyRegistered = internalUser.newlyRegistered;
        // Store provider to skip security questions for Zitadel users
        token.provider = account.provider;

        // Check if user has setup required Security Questions
        if (account.provider !== "gcForms" && !token.hasSecurityQuestions) {
          token.hasSecurityQuestions = await userHasSecurityQuestions({ userId: token.userId });
        }

        // If name isn't passed in by the provider, use the name from the database
        if (!token.name) {
          token.name = internalUser.name ?? "";
        }
      }

      // Client side session update (e.g. when a user has accepted the Acceptable Use Policy)
      // Only permit the updating of certain properties

      if (trigger === "update" && session) {
        logMessage.debug(
          `Client Side Session update recieved for user ${token.email} with ${JSON.stringify(session)}`
        );
        token = {
          ...token,
          acceptableUse: session.user.acceptableUse,
        };
      }

      // Any logic that needs to happen after JWT initializtion needs to be below this point.

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

      return token;
    },
    async session(params) {
      const { session, token } = params as { session: Session; token: JWT };
      const userProfile = token.profile as
        | {
            givenName?: string;
            familyName?: string;
            preferredUsername?: string;
            emailVerified?: boolean;
          }
        | undefined;
      // Add info like 'role' to session object
      session.user = {
        id: token.userId ?? "",
        lastLoginTime: token.lastLoginTime,
        acceptableUse: token.acceptableUse ?? false,
        name: token.name ?? null,
        email: token.email,
        accountUrl: token.provider === "gcForms" ? token.accountUrl : undefined,
        oidcIdToken: token.provider === "gcForms" ? token.oidcIdToken : undefined,
        privileges: await getPrivilegeRulesForUser(token.userId as string),
        ...(token.provider !== "gcForms" &&
          token.newlyRegistered && { newlyRegistered: token.newlyRegistered }),
        // Used client side to immidiately log out a user if they have been deactivated
        ...(token.deactivated && { deactivated: token.deactivated }),
        featureFlags: await getUserFeatureFlags(token.userId as string),
        hasSecurityQuestions:
          token.provider === "gcForms" ? true : (token.hasSecurityQuestions ?? false),
      };
      (session.user as Session["user"] & { profile?: typeof userProfile }).profile = userProfile;
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

const cachedAuth = cache(auth);

export { GET, POST, signIn, signOut, cachedAuth as auth };
