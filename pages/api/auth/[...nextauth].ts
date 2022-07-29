import NextAuth from "next-auth";

import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { logMessage } from "@lib/logger";

import type { NextApiRequest, NextApiResponse } from "next";
import { isTokenExists } from "@lib/middleware/validTemporaryToken";

const prisma = new PrismaClient();

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  // Configure one or more authentication providers

  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
    throw new Error("Missing Google Authentication Credentials");

  return await NextAuth(req, res, {
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      }),
      CredentialsProvider({
        // The name to display on the sign in form (e.g. 'Sign in with...')
        name: "my-project",
        // The credentials is used to generate a suitable form on the sign in page.
        // You can specify whatever fields you are expecting to be submitted.
        // e.g. domain, username, password, 2FA token, etc.
        // You can pass any HTML attribute to the <input> tag through the object.
        credentials: {
          email: { label: "email", type: "email" },
          token: { label: "temporaryToken", type: "password" },
          formID: { formID: "email", type: "string" },
        },
        async authorize(credentials) {
          let authorized = false;
          if (credentials) {
            authorized = await isTokenExists(
              credentials.formID,
              credentials.email,
              credentials.token
            );
            if (authorized) {
              return { email: credentials?.formID };
            }
          }
          // Return null if user data could not be retrieved
          return null;
        },
      }),
    ],
    secret: process.env.TOKEN_SECRET,
    session: {
      strategy: "database",
      // Seconds - How long until an idle session expires and is no longer valid.
      maxAge: 2 * 60 * 60, // 2 hours
      // Seconds - Throttle how frequently to write to database to extend a session.
      // Use it to limit write operations. Set to 0 to always update the database.
      updateAge: 24 * 60 * 60, // 24 hours
    },
    pages: {
      signIn: "/admin/login",
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
      async session({ session, user }) {
        // Add info like 'role' or 'admin' to session object
        const extendedInfo = {
          user: {
            ...session.user,
            id: user.id,
            // set the value explicitly to admin if `user.admin` does not exist.
            // user.admin is undefined if it's the first time a user logs in.
            admin: user.admin ?? false,
          },
        };
        return { ...session, ...extendedInfo };
      },
    },
  });
}
