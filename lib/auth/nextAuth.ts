import CredentialsProvider from "next-auth/providers/credentials";
import NextAuth, { Session } from "next-auth";

import { validate2FAVerificationCode, userHasSecurityQuestions } from "@lib/auth/";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { getOrCreateUser } from "@lib/users";
import { prisma } from "@lib/integration/prismaConnector";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import { activeStatusCheck, activeStatusUpdate } from "@lib/cache/userActiveStatus";
import { JWT } from "next-auth/jwt";

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
        )
          return null;

        // Check for test accounts being used
        if (
          [
            "test.user@cds-snc.ca",
            "test.admin@cds-snc.ca",
            "test.deactivated@cds-snc.ca",
            "test.withoutSecurityAnswers@cds-snc.ca",
          ].includes(username)
        ) {
          // If we're not in test mode throw an error
          if (process.env.APP_ENV !== "test")
            throw new Error("Test accounts only available in testing mode");

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
          if (!decodedCognitoToken)
            throw new Error("Missing decoded Cognito token in 2FA validation result");
          return decodedCognitoToken;
        }
        return null;
      },
    }),
  ],
  secret: process.env.TOKEN_SECRET,
  session: {
    strategy: "jwt",
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 2 * 60 * 60, // 2 hours
  },
  trustHost: true,
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, ...message) {
      logMessage.error(
        `NextAuth error - Code: ${code}. Error: ${JSON.stringify(message, (_, value) => {
          if (value?.constructor.name === "Error") {
            return {
              name: value.name,
              message: value.message,
              stack: value.stack,
              cause: value.cause,
            };
          }
          return value;
        })}`
      );
    },
    warn(code) {
      logMessage.warn(`NextAuth warning - Code: ${code}`);
    },
  },

  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user }) {
      if (!user.email) {
        throw new Error(
          "Could not produce UserSignIn audit log because of undefined email information"
        );
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
        throw new Error("Could not produce UserSignIn audit log because user does not exist");
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
          throw new Error(`JWT token does not have an email for user with name ${token.name}`);
        }
        const user = await getOrCreateUser(token);
        if (user === null)
          throw new Error(`Could not get or create user with email: ${token.email}`);

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
          ...(session.user.newlyRegistered && { newlyRegistered: session.user.newlyRegistered }),
        };
      }

      // Any logic that needs to happen after JWT initializtion needs to be below this point.

      // Check if user has accepted the Acceptable Use Policy
      // if (!token.acceptableUse && token.userId) {
      //   token.acceptableUse = await getAcceptableUseValue(token.userId);
      // }

      // Check if user has setup required Security Questions
      if (!token.hasSecurityQuestions) {
        token.hasSecurityQuestions = await userHasSecurityQuestions({ userId: token.userId });
      }

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
      logMessage.debug(`JWT refreshed for user ${token.email}`);
      return token;
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
        image: token.picture ?? null,
        privileges: await getPrivilegeRulesForUser(token.userId as string),
        ...(token.newlyRegistered && { newlyRegistered: token.newlyRegistered }),
        // Used client side to immidiately log out a user if they have been deactivated
        ...(token.deactivated && { deactivated: token.deactivated }),
        hasSecurityQuestions: token.hasSecurityQuestions ?? false,
      };
      logMessage.debug(`Session refreshed for user ${token.email}`);
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
