import {
  createMongoAbility,
  MongoAbility,
  RawRuleOf,
  InferSubjects,
  MongoQuery,
} from "@casl/ability";
import { FormRecord } from "@lib/types";
import { User, Privilege as PrismaPrivilege } from "@prisma/client";
import { AnyObject } from "immer/dist/internal";
import get from "lodash/get";
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
  conditions?: MongoQuery<AnyObject>;
};
export interface Privilege extends PrismaPrivilege {
  permissions: Permission[];
  [key: string]: string | null | Permission[];
}

export function interpolatePermissionCondition(
  condition: MongoQuery<AnyObject>,
  values: AnyObject
): MongoQuery<AnyObject> {
  const placeHolderRegex = /\$\{[^}]*\}/g;
  const objectPathRegex = /([a-zA-Z]+(\.*[a-zA-Z]+)+)/;

  const conditionAsString = JSON.stringify(condition);
  const placeHolder = conditionAsString.matchAll(placeHolderRegex);

  const interpolatedString = Array.from(placeHolder).reduce((acc, current) => {
    const objectPath = current[0].match(objectPathRegex);

    if (objectPath) {
      const value = get(values, objectPath[0]);

      if (value !== undefined) {
        return acc.replace(current[0], String(value));
      } else {
        throw new Error(
          `Could not interpolate permission condition because of missing value (${objectPath[0]})`
        );
      }
    } else {
      throw new Error("Could not find object path in permission condition placeholder");
    }
  }, conditionAsString);

  return JSON.parse(interpolatedString);
}
