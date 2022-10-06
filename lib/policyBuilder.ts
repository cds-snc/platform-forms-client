import { createMongoAbility, MongoAbility, RawRuleOf, InferSubjects } from "@casl/ability";
import { FormRecord } from "@lib/types";
import { User, Privilege as PrismaPrivilege } from "@prisma/client";
/*
This file is referenced by the useAccessControl hook so no server-side
only dependencies can be referenced in this file.
 */

interface CASL_FormRecord extends FormRecord {
  kind: "FormRecord";
}

interface CASL_User extends User {
  kind: "User";
}

interface CASL_Privilege extends Privilege {
  kind: "Privilege";
}

export type Action = "manage" | "create" | "view" | "update" | "delete";

export type Subject = InferSubjects<CASL_FormRecord | CASL_User | CASL_Privilege>;

export type Abilities = [Action, Subject];
export type AppAbility = MongoAbility<Abilities>;
export const createAbility = (rules: RawRuleOf<AppAbility>[]) =>
  createMongoAbility<AppAbility>(rules);
export class AccessControlError extends Error {}
export type Ability = MongoAbility;
export type Permission = {
  action: Action | Action[];
  subject: Extract<Subject, string> | Extract<Subject, string>[];
  condition?: string;
};
export interface Privilege extends PrismaPrivilege {
  permissions: Permission[];
  [key: string]: string | null | Permission[];
}
