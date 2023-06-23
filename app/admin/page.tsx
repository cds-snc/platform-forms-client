import React from "react";
import { getProviders } from "next-auth/react";
import { getServerSession } from "next-auth";
import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@lib/integration/prismaConnector";
import {
  Validate2FAVerificationCodeResultStatus,
  begin2FAAuthentication,
  initiateSignIn,
  validate2FAVerificationCode,
} from "@lib/auth/";


const authOptions: NextAuthOptions = {
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
        // Application is in test mode, return test use
        return {
          id: "1",
          name: "Test User",
          email: "test.user@cds-snc.ca",
        };
      },
    }),
  ],
  secret: process.env.TOKEN_SECRET,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 2 * 60 * 60, // 2 hours
  },
  callbacks: {
    async session({ session, token }) {

      
      // Add info like 'role' to session object

      session.user = {
        id: token.userId,
        lastLoginTime: token.lastLoginTime,
        acceptableUse: token.acceptableUse,
        name: token.name ?? null,
        email: token.email ?? null,
        image: token.picture ?? null,
        privileges: [],
        ...(token.newlyRegistered && { newlyRegistered: token.newlyRegistered }),
      };

      return session;
    },
  },
};

import Link from "next/link";
export default async function DemoPage() {
  const providers = await getProviders();
  const session = await getServerSession(authOptions);
  return (
    <>
      <h1>Admin home page</h1>
      <div>
        <Link href="/admin/accounts">Test {JSON.stringify(session)}</Link>
        {providers &&
          Object.values(providers).map((provider) => (
            <div key={provider.name} className="flex justify-center rounded-md bg-white">
              {provider.name}
            </div>
          ))}
      </div>
    </>
  );
}
