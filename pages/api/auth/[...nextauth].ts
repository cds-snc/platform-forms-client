import NextAuth, { Session, JWT, NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { validateTemporaryToken } from "@lib/auth";
import { getOrCreateUser } from "@lib/users";
import { LoggingAction } from "@lib/auth";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";
import { acceptableUseCheck, removeAcceptableUse } from "@lib/acceptableUseCache";
import { getPrivilegeRulesForUser } from "@lib/privileges";
import { interpolatePermissionCondition } from "@lib/policyBuilder";

if (
  (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) &&
  process.env.NODE_ENV !== "test"
)
  throw new Error("Missing Google Authentication Credentials");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      name: "TemporaryToken",
      credentials: {
        temporaryToken: { label: "Temporary Token", type: "text" },
      },
      async authorize(credentials) {
        // If the temporary token is missing don't process further
        if (!credentials?.temporaryToken) return null;
        const user = await validateTemporaryToken(credentials.temporaryToken);

        if (user) {
          // Type limitations on the Class only allow the return of id and email.
          return { id: user.id, email: user.email };
        } else {
          return null;
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
      // Account is only available on the first callback after a login.
      // Since this is the initial creation of the JWT we add the properties
      switch (account?.provider) {
        case "google": {
          const user = await getOrCreateUser(token as JWT);
          if (user === null)
            throw new Error(`Could not get or create user with email: ${token.email}`);
          token.userId = user.id;
          token.authorizedForm = null;
          token.lastLoginTime = new Date();
          token.acceptableUse = false;
          token.privileges = user.privileges.map((privilege) => privilege.permissions);

          break;
        }
      }
      // The swtich case above is only run on initial JWT creation and not on any subsequent checks
      // Any logic that needs to happen after JWT initializtion needs to be below this point.
      if (!token.acceptableUse) {
        token.acceptableUse = await getAcceptableUseValue(token.userId as string);
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add info like 'role' to session object
      session.user.id = token.userId as string;
      session.user.authorizedForm = token.authorizedForm;
      session.user.lastLoginTime = token.lastLoginTime;
      session.user.acceptableUse = token.acceptableUse;
      session.user.name = token.name ?? null;
      session.user.image = token.picture ?? null;

      const privileges = await getPrivilegeRulesForUser(token.userId as string);
      if (!privileges.length) throw new Error("User has no privileges");

      session.user.privileges = privileges.map((p) => {
        return p.conditions
          ? {
              ...p,
              conditions: interpolatePermissionCondition(p.conditions, {
                userId: token.userId as string,
              }),
            }
          : p;
      });

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
const getAcceptableUseValue = async (userId: string) => {
  if (!userId) return false;
  const acceptableUse = await acceptableUseCheck(userId);

  // The requirement states that the key must be removed from cache
  // once it's retrieved.

  if (acceptableUse) await removeAcceptableUse(userId);
  return acceptableUse;
};

export default NextAuth(authOptions);
