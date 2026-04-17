import { Abilities } from "@lib/types";
import { RawRuleOf, MongoAbility } from "@casl/ability";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      profile?: {
        givenName?: string;
        familyName?: string;
        preferredUsername?: string;
        emailVerified?: boolean;
      };
      accountUrl?: string;
      lastLoginTime?: Date;
      privileges: RawRuleOf<MongoAbility<Abilities>>[];
      acceptableUse: boolean;
      newlyRegistered?: boolean;
      deactivated?: boolean;
      hasSecurityQuestions: boolean;
      featureFlags?: string[];
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    name: string;
    email: string;
    profile?: {
      givenName?: string;
      familyName?: string;
      preferredUsername?: string;
      emailVerified?: boolean;
    };
    provider?: string;
    issuer?: string;
    accountUrl?: string;
    lastLoginTime?: Date;
    acceptableUse?: boolean;
    hasSecurityQuestions?: boolean;
    newlyRegistered?: boolean;
    deactivated?: boolean;
  }
}
