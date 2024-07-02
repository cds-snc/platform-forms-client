import { Abilities } from "@lib/types";
import { RawRuleOf, MongoAbility } from "@casl/ability";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      lastLoginTime?: Date;
      privileges: RawRuleOf<MongoAbility<Abilities>>[];
      acceptableUse: boolean;
      newlyRegistered?: boolean;
      deactivated?: boolean;
      hasSecurityQuestions: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    name: string;
    email: string;
    lastLoginTime?: Date;
    acceptableUse?: boolean;
    hasSecurityQuestions?: boolean;
    newlyRegistered?: boolean;
    deactivated?: boolean;
  }
}
