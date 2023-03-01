import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  CognitoIdentityProviderClient,
  AdminInitiateAuthCommand,
  AdminInitiateAuthCommandInput,
  CognitoIdentityProviderServiceException,
} from "@aws-sdk/client-cognito-identity-provider";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { getOrCreateUser } from "@lib/users";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { acceptableUseCheck, removeAcceptableUse } from "@lib/acceptableUseCache";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { logEvent } from "@lib/auditLogs";

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
      name: "CognitoLogin",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // If the temporary token is missing don't process further
        if (!credentials?.username || !credentials?.password) return null;
        const params: AdminInitiateAuthCommandInput = {
          AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
          ClientId: process.env.COGNITO_APP_CLIENT_ID,
          UserPoolId: process.env.COGNITO_USER_POOL_ID,
          AuthParameters: {
            USERNAME: credentials.username,
            PASSWORD: credentials.password,
          },
        };

        // NextAuth signIn callback cannot be used to check . The check has to be included in here as the url field
        // of the response of the sign in callback is not populated
        const prismaUser = await prisma.user
          .findUnique({
            where: {
              email: credentials.username,
            },
            select: {
              accounts: true,
            },
          })
          .catch((e) => prismaErrors(e, null));

        if (
          prismaUser &&
          prismaUser.accounts.length > 0 &&
          prismaUser.accounts[0].provider === "google"
        ) {
          throw new Error("GoogleCredentialsExist");
        }

        try {
          const cognitoClient = new CognitoIdentityProviderClient({
            region: process.env.COGNITO_REGION,
          });

          const adminInitiateAuthCommand = new AdminInitiateAuthCommand(params);

          const response = await cognitoClient.send(adminInitiateAuthCommand);
          const idToken = response.AuthenticationResult?.IdToken;
          if (idToken) {
            const cognitoIDTokenParts = idToken.split(".");
            const claimsBuff = Buffer.from(cognitoIDTokenParts[1], "base64");
            const cognitoIDTokenClaims = JSON.parse(claimsBuff.toString("utf8"));
            return {
              id: cognitoIDTokenClaims.sub,
              name: cognitoIDTokenClaims.name,
              email: cognitoIDTokenClaims.email,
            };
          }
          return null;
        } catch (e) {
          if (
            e instanceof CognitoIdentityProviderServiceException &&
            e.name === "NotAuthorizedException" &&
            e.message === "Password attempts exceeded"
          )
            logEvent(
              prismaUser?.accounts[0].id ?? "unknown",
              { type: "User", id: prismaUser?.accounts[0].id ?? "unknown" },
              "UserTooManyFailedAttempts",
              `Password attempts exceeded for ${credentials.username}`
            );

          // throw new Error with cognito error converted to string so as to include the exception name
          throw new Error((e as CognitoIdentityProviderServiceException).toString());
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
  logger: {
    error(code, metadata) {
      logMessage.error(code, metadata);
    },
    warn(code) {
      logMessage.warn(code);
    },
    debug(code, metadata) {
      logMessage.debug(code, metadata);
    },
  },

  adapter: PrismaAdapter(prisma),
  events: {
    async signIn({ user }) {
      logEvent(user.id, { type: "User", id: user.id }, "UserSignIn");
    },
    async signOut({ token }) {
      logEvent((token as JWT).userId, { type: "User", id: token.userId }, "UserSignOut");
    },
    async createUser({ user }) {
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

export default NextAuth(authOptions);
