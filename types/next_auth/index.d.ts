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
      email: string;
      image?: string | null;
      newlyRegistered?: boolean;
      deactivated?: boolean;
      hasSecurityQuestions: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    userId: string;
    name: string;
    email: string;
    lastLoginTime: Date;
    acceptableUse: boolean;
    hasSecurityQuestions: boolean;
    newlyRegistered?: boolean;
    deactivated?: boolean;
  }
}
