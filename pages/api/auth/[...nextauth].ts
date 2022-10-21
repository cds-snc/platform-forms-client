import NextAuth, { Session, JWT, NextAuthOptions } from "next-auth";
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
import { LoggingAction } from "@lib/auth";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { acceptableUseCheck, removeAcceptableUse } from "@lib/acceptableUseCache";

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
            const cognitoIDTokenClaims = JSON.parse(claimsBuff.toString("ascii"));
            return {
              id: cognitoIDTokenClaims.sub,
              name: cognitoIDTokenClaims.name,
              email: cognitoIDTokenClaims.email,
            };
          }
          return null;
        } catch (e) {
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

  callbacks: {
    async jwt({ token, account }) {
      // account is only available on the first call to the JWT function
      if (account?.provider) {
        if (!token.sub) {
          throw new Error(`JWT token does not have an id for user with email ${token.email}`);
        }
        const user = await getOrCreateUser(token);
        if (user === null)
          throw new Error(`Could not get or create user with email: ${token.email}`);

        token.userId = user.id;
        token.authorizedForm = null;
        token.lastLoginTime = new Date();
        token.role = user.role;
        token.acceptableUse = false;
      }

      // Any logic that needs to happen after JWT initializtion needs to be below this point.
      if (!token.acceptableUse) {
        token.acceptableUse = await getAcceptableUseValue(token.userId as string);
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add info like 'role' to session object
      session.user.userId = token.userId as string;
      session.user.authorizedForm = token.authorizedForm;
      session.user.lastLoginTime = token.lastLoginTime;
      session.user.role = token.role;
      session.user.acceptableUse = token.acceptableUse;
      session.user.name = token.name ?? null;
      session.user.image = token.picture ?? null;
      return session;
    },
  },

  events: {
    async signIn({ user }) {
      // Not throwing an Error as it could potentially redirect the user to an Error page
      // This error should be transparent to a user.
      try {
        const formUser = await prisma.formUser.findUnique({
          where: {
            id: user.id,
          },
          select: {
            id: true,
          },
        });
        if (formUser) {
          await prisma.accessLog.create({
            data: {
              action: LoggingAction.LOGIN,
              userId: user.id,
            },
          });
        }
      } catch (e) {
        prismaErrors(e, null);
      }
    },
    async signOut({ token }) {
      try {
        if (!token.userId) {
          // Not throwing an Error as it could potentially redirect the user to an Error page
          // This error should be transparent to a user.
          logMessage.warn(`Could not record Signout, token corrupt : ${JSON.stringify(token)}`);
          return;
        }

        const formUser = await prisma.formUser.findUnique({
          where: {
            id: token.userId as string,
          },
          select: {
            id: true,
          },
        });
        if (formUser) {
          await prisma.accessLog.create({
            data: {
              action: LoggingAction.LOGOUT,
              userId: token.userId as string,
            },
          });
        }
      } catch (e) {
        prismaErrors(e, null);
      }
    },
  },
};

/**
 * Get the acceptable Use value.
 * if key exists in cache return value and remove the key from cache
 * otherwise return false
 * @returns boolean
 */
const getAcceptableUseValue = async (userId: string | undefined) => {
  if (!userId) return false;
  const acceptableUse = await acceptableUseCheck(userId);

  // The requirement states that the key must be removed from cache
  // once it's retrieved.

  if (acceptableUse) await removeAcceptableUse(userId);
  return acceptableUse;
};

export default NextAuth(authOptions);
