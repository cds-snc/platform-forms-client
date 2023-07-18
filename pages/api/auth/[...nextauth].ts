import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  Validate2FAVerificationCodeResultStatus,
  begin2FAAuthentication,
  initiateSignIn,
  validate2FAVerificationCode,
} from "@lib/auth/";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { getOrCreateUser } from "@lib/users";
import { prisma } from "@lib/integration/prismaConnector";
import { acceptableUseCheck, removeAcceptableUse } from "@lib/acceptableUseCache";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import type { NextApiRequest, NextApiResponse } from "next";

if (
  (!process.env.COGNITO_APP_CLIENT_ID ||
    !process.env.COGNITO_REGION ||
    !process.env.COGNITO_USER_POOL_ID) &&
  process.env.APP_ENV !== "test"
)
  throw new Error("Missing Cognito Credentials");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "cognito",
      name: "CognitoLogin",
      credentials: {
        authenticationFlowToken: { label: "Authentication flow token", type: "text" },
        username: { label: "Username", type: "text" },
        verificationCode: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        const { authenticationFlowToken, username, verificationCode } = credentials ?? {};

        // Application is in test mode, return test user
        if (process.env.APP_ENV === "test") {
          if (
            !username ||
            ![
              "test.user@cds-snc.ca",
              "testadmin.user@cds-snc.ca",
              "test.deactivated@cds-snc.ca",
            ].includes(username)
          ) {
            throw new Error("Must use testing accounts when in test Mode");
          }

          // @todo - look into doing a local user lookup vs hardcoding the user

          if (username === "test.deactivated@cds-snc.ca") {
            return {
              id: "100",
              email: username,
            };
          }

          return {
            id: "1",
            email: username,
          };
        }

        // Check to ensure all required credentials were passed in
        if (!authenticationFlowToken || !username || !verificationCode) return null;

        const validationResult = await validate2FAVerificationCode(
          authenticationFlowToken,
          username,
          verificationCode
        );

        switch (validationResult.status) {
          case Validate2FAVerificationCodeResultStatus.VALID: {
            if (!validationResult.decodedCognitoToken)
              throw new Error("Missing decoded Cognito token");
            return validationResult.decodedCognitoToken;
          }
          case Validate2FAVerificationCodeResultStatus.INVALID:
            throw new Error("2FAInvalidVerificationCode");
          case Validate2FAVerificationCodeResultStatus.EXPIRED:
            throw new Error("2FAExpiredSession");
          case Validate2FAVerificationCodeResultStatus.LOCKED_OUT:
            throw new Error("2FALockedOutSession");
        }
      },
    }),
  ],
  secret: process.env.TOKEN_SECRET,
  session: {
    strategy: "jwt",
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 2 * 60 * 60, // 2 hours
  },
  debug: process.env.NODE_ENV !== "production",
  logger: {
    error(code, metadata) {
      logMessage.error(code, metadata);
    },
    warn(code) {
      logMessage.warn(code);
    },
  },

  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user }) {
      logEvent(user.id, { type: "User", id: user.id }, "UserSignIn");
    },
    async signOut({ token }) {
      logEvent(token.userId, { type: "User", id: token.userId }, "UserSignOut");
    },
  },

  callbacks: {
    async jwt({ token, account }) {
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
        token.acceptableUse = false;
        token.newlyRegistered = user.newlyRegistered;
      }

      // Any logic that needs to happen after JWT initializtion needs to be below this point.
      if (!token.acceptableUse) {
        token.acceptableUse = await getAcceptableUseValue(token.userId as string);
      }

      return token;
    },
    async session({ session, token }) {
      // Add info like 'role' to session object

      session.user = {
        id: token.userId,
        lastLoginTime: token.lastLoginTime,
        acceptableUse: token.acceptableUse,
        name: token.name ?? null,
        email: token.email ?? null,
        image: token.picture ?? null,
        privileges: await getPrivilegeRulesForUser(token.userId as string),
        ...(token.newlyRegistered && { newlyRegistered: token.newlyRegistered }),
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
};

/**
 * Get the acceptable Use value.
 * if key exists in cache return value and remove the key from cache
 * otherwise return false
 * @returns boolean
 */
const getAcceptableUseValue = async (userId: string) => {
  if (!userId) return false;
  const acceptableUse = await acceptableUseCheck(userId);

  // The requirement states that the key must be removed from cache
  // once it's retrieved.

  if (acceptableUse) await removeAcceptableUse(userId);
  return acceptableUse;
};

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Listens for the sign-in action for Cognito to initiate the sign in process
  if (
    Array.isArray(req.query.nextauth) &&
    req.query.nextauth?.includes("signin") &&
    req.query.nextauth?.includes("cognito")
  ) {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ status: "error", error: "Missing username or password" });

    if (process.env.APP_ENV === "test") {
      if (username === "test.deactivated@cds-snc.ca") {
        // -> return error that would be thrown by begin2FAAuthentication
        return res.status(401).json({
          status: "error",
          error: "Cognito authentication failed",
          reason: "AccountDeactivated",
        });
      }

      return res.status(200).json({
        status: "success",
        challengeState: "MFA",
        authenticationFlowToken: "0000-1111-2222-3333",
      });
    }

    try {
      const cognitoToken = await initiateSignIn({
        username: username,
        password: password,
      });

      if (cognitoToken) {
        const authenticationFlowToken = await begin2FAAuthentication(cognitoToken);
        return res.status(200).json({
          status: "success",
          challengeState: "MFA",
          authenticationFlowToken: authenticationFlowToken,
        });
      } else {
        return res.status(400).json({
          status: "error",
          error: "Cognito authentication failed",
          reason: "Missing Cognito token",
        });
      }
    } catch (error) {
      return res.status(401).json({
        status: "error",
        error: "Cognito authentication failed",
        reason: (error as Error).message,
      });
    }
  }

  // Runs the NextAuth.js flow
  return NextAuth(req, res, authOptions);
}
