import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  Validate2FAVerificationCodeResultStatus,
  begin2FAAuthentication,
  initiateSignIn,
  validate2FAVerificationCode,
} from "@lib/auth/cognito";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { getOrCreateUser } from "@lib/users";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { acceptableUseCheck, removeAcceptableUse } from "@lib/acceptableUseCache";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import type { NextApiRequest, NextApiResponse } from "next";

if (
  (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) &&
  process.env.APP_ENV !== "test"
)
  throw new Error("Missing Google Authentication Credentials");

if (
  (!process.env.COGNITO_APP_CLIENT_ID ||
    !process.env.COGNITO_REGION ||
    !process.env.COGNITO_USER_POOL_ID) &&
  process.env.APP_ENV !== "test"
)
  throw new Error("Missing Cognito Credentials");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "cognito",
      name: "CognitoLogin",
      credentials: {
        authenticationFlowToken: { label: "Authentication flow token", type: "text" },
        username: { label: "Username", type: "text" },
        verificationCode: { label: "Verification Code", type: "text" },
      },
      async authorize(credentials) {
        // Application is in test mode, return test user
        if (process.env.APP_ENV === "test") {
          return {
            id: "1",
            name: "Test User",
            email: "test.user@cds-snc.ca",
          };
        }

        const { authenticationFlowToken, username, verificationCode } = credentials ?? {};

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
    async createUser({ user }) {
      // This only fires for non-credential providers
      // CredentialProvider user registration is triggered in getOrCreateUser
      logEvent(user.id, { type: "User", id: user.id }, "UserRegistration");
    },
  },

  callbacks: {
    async signIn({ account, profile }) {
      // redirect google login if there is an existing cognito account
      if (account?.provider === "google") {
        const prismaUser = await prisma.user
          .findUnique({
            where: {
              email: profile?.email,
            },
            select: {
              accounts: true,
            },
          })
          .catch((e) => prismaErrors(e, null));

        // in this case we know there is an existing cognito account
        if (prismaUser?.accounts.length === 0) {
          return "/auth/login";
        }
      }
      return true;
    },
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
      }

      // Any logic that needs to happen after JWT initializtion needs to be below this point.
      if (!token.acceptableUse) {
        token.acceptableUse = await getAcceptableUseValue(token.userId as string);
      }

      return token;
    },
    async session({ session, token }) {
      // Add info like 'role' to session object
      session.user.id = token.userId;
      session.user.lastLoginTime = token.lastLoginTime;
      session.user.acceptableUse = token.acceptableUse;
      session.user.name = token.name ?? null;
      session.user.image = session.user?.image ?? null;
      session.user.privileges = await getPrivilegeRulesForUser(token.userId as string);

      return session;
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
  if (req.query.nextauth?.includes("signin") && req.query.nextauth?.includes("cognito")) {
    const { username, password } = req.body;

    if (!username || !password)
      return res.status(400).json({ status: "error", error: "Missing username or password" });

    if (process.env.APP_ENV === "test") {
      return res.status(200).json({ status: "success", challengeState: "MFA" });
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
  return await NextAuth(req, res, authOptions);
}
