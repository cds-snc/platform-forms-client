import { Abilities } from "@lib/types";
import { RawRuleOf, MongoAbility } from "@casl/ability";
import type { User as DefaultUser } from "next-auth";
import { TypeOmit } from "@lib/types";
declare module "next-auth" {
  interface User extends TypeOmit<DefaultUser, "id" | "email"> {
    id: string;
    email: string;
  }

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
