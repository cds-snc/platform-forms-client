import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      userId?: string;
      admin?: boolean;
      authorizedForm?: string;
      lastLoginTime?: Date;
      role?: string;
      acceptableUse?: boolean;
    };
  }

  interface User extends DefaultUser {
    id: string;
    admin: boolean | null;
  }

  interface JWT extends DefaultJWT {
    admin?: boolean;
    userId?: string;
    authorizedForm?: string;
    lastLoginTime?: Date;
    role?: string;
    acceptableUse?: boolean;
  }
}
