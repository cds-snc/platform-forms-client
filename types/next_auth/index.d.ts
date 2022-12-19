import { DefaultSession, DefaultUser } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { Abilities } from "@lib/types";
import { RawRuleOf, MongoAbility } from "@casl/ability";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession`, `unstable_getServerSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session extends DefaultSession {
    user: {
      id: string;
      authorizedForm?: string;
      lastLoginTime?: Date;
      privileges: RawRuleOf<MongoAbility<Abilities>>[];
      acceptableUse?: boolean;
      name?: string | null;
      email: string | null;
      image?: string | null;
    };
  }

  interface User extends DefaultUser {
    id: string;
    privileges: RawRuleOf<MongoAbility<Abilities>>[];
    ability?: Ability;
  }

  interface JWT extends DefaultJWT {
    userId?: string;
    authorizedForm?: string;
    lastLoginTime?: Date;
    privileges?: RawRuleOf<MongoAbility<Abilities>>[];
    acceptableUse?: boolean;
  }
}
