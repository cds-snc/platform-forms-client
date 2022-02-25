import NextAuth from "next-auth";
import Providers from "next-auth/providers";
import Adapters from "next-auth/adapters";

import Models from "../../../migrations/models";

export default NextAuth({
  // Configure one or more authentication providers

  providers: [
    Providers.Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // A database is optional, but required to persist accounts in a database
  database: process.env.DATABASE_URL,

  adapter: process.env.DATABASE_URL
    ? Adapters.TypeORM.Adapter(process.env.DATABASE_URL, {
        models: {
          User: Models.User,
        },
      })
    : undefined,
  callbacks: {
    async session(session, user) {
      // Add info like 'role' or 'admin' to session object
      const extendedInfo = {
        user: {
          ...session.user,
          admin: user.admin ?? false,
        },
      };
      const extendedSession = { ...session, ...extendedInfo };
      return extendedSession;
    },
  },
});
