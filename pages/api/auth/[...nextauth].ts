import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { initiateSignIn } from "@lib/cognito";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { getOrCreateUser } from "@lib/users";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { acceptableUseCheck, removeAcceptableUse } from "@lib/acceptableUseCache";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";
import type { NextApiRequest, NextApiResponse } from "next";
import { generateVerificationCode, sendVerificationCode } from "@lib/2fa";

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

    /*
    const result = await initiateSignIn({
      username: req.body.username,
      password: req.body.password,
    });

    res.status(200).json(result);
    */

    const verificationCode = await generateVerificationCode();
    await sendVerificationCode(username, verificationCode);

    res.status(200).json({ status: "success", challengeState: "MFA" });

    return;
  }
  // Runs the NextAuth.js flow
  return await NextAuth(req, res, authOptions);
}
