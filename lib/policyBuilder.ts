import { PureAbility, RawRuleOf, InferSubjects, MatchConditions } from "@casl/ability";
import { FormRecord } from "@lib/types";
import { User } from "@prisma/client";
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

export type Action = "manage" | "create" | "view" | "update" | "delete";

export type Subject = InferSubjects<CASL_FormRecord | CASL_User>;

export type Abilities = [Action, Subject];
export type AppAbility = PureAbility<Abilities, MatchConditions>;
export type Ability = PureAbility<Abilities, unknown>;
export const createAbility = (rules: RawRuleOf<AppAbility>[]) => new PureAbility<Abilities>(rules);
export class AccessControlError extends Error {}
