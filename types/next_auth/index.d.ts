import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { AppAbility, Ability } from "@lib/policyBuilder";
import { RawRuleOf } from "@casl/ability";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession`, `unstable_getServerSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      authorizedForm?: string;
      lastLoginTime?: Date;
      privelages: RawRuleOf<AppAbility>[];
      acceptableUse?: boolean;
      name?: string | null;
      email: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    privelages: RawRuleOf<AppAbility>[];
    ability?: Ability;
  }

  interface JWT extends DefaultJWT {
    userId?: string;
    authorizedForm?: string;
    lastLoginTime?: Date;
    privelages?: RawRuleOf<AppAbility>[];
    acceptableUse?: boolean;
  }
}
