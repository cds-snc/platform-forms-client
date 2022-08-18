import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession`, `unstable_getServerSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      userId?: string;
      authorizedForm?: string;
      lastLoginTime?: Date;
      role?: string;
      acceptableUse?: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    role?: string | null;
  }

  interface JWT extends DefaultJWT {
    userId?: string;
    authorizedForm?: string;
    lastLoginTime?: Date;
    role?: string;
    acceptableUse?: boolean;
  }
}
