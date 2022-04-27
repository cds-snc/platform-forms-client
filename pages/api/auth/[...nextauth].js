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

  adapter:
    process.env.DATABASE_URL &&
    Adapters.TypeORM.Adapter(process.env.DATABASE_URL, {
      models: {
        User: Models.User,
      },
    }),

  callbacks: {
    async session(session, user) {
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
