import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id?: string;
      admin?: boolean;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    id?: number;
    admin?: boolean;
  }
}
