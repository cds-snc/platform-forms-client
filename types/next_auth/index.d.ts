import { Abilities } from "@lib/types";
import { RawRuleOf, MongoAbility } from "@casl/ability";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession`, `getServerSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      lastLoginTime?: Date;
      privileges: RawRuleOf<MongoAbility<Abilities>>[];
      acceptableUse: boolean;
      name: string | null;
      email: string | null;
      image?: string | null;
      newlyRegistered?: boolean;
      deactivated?: boolean;
      securityQuestions?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    userId: string;
    name: string;
    lastLoginTime: Date;
    privileges: RawRuleOf<MongoAbility<Abilities>>[];
    acceptableUse: boolean;
    newlyRegistered?: boolean;
    deactivated?: boolean;
  }
}
