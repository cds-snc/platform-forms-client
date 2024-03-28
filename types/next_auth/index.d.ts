import { Abilities } from "@lib/types";
import { RawRuleOf, MongoAbility } from "@casl/ability";

declare module "next-auth" {
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

  interface User {
    id: string;
    name?: string | null;
    email: string;
  }
}

// Hopefully guidance will be provided soon by Next-Auth on how to better augment this module

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
