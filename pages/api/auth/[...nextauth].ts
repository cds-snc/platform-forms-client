import NextAuth, { Session, JWT, NextAuthOptions } from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { logMessage } from "@lib/logger";
import { validateTemporaryToken } from "@lib/auth";
import { getFormUser, getOrCreateUser } from "@lib/users";
import { UserRole } from "@prisma/client";
import { LoggingAction } from "@lib/auth";
import { prisma, prismaErrors } from "@lib/integration/prismaConnector";

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
          token.role = user.role;
          token.acceptableUse = false;
          break;
        }

        case "credentials": {
          if (!token.sub)
            throw new Error(`JWT token does not have an id for user with email ${token.email}`);

          const user = await getFormUser(token.sub);

          token.userId = user?.id;
          token.authorizedForm = user?.templateId;
          token.lastLoginTime = new Date();
          token.role = user?.active ? UserRole.PROGRAM_ADMINISTRATOR : null; // TODO: change it so there is a "role" field for FormUser
          token.acceptableUse = false;
        }
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

export default NextAuth(authOptions);
