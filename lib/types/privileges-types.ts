import { InferSubjects, MongoQuery, MongoAbility } from "@casl/ability";
import { FormRecord } from "@lib/types";
import { User, Privilege as PrismaPrivilege, Setting } from "@prisma/client";

interface CASL_FormRecord extends FormRecord {
  kind: "FormRecord";
}

interface CASL_User extends User {
  kind: "User";
  [key: string]: string | null | Date;
}

interface CASL_Privilege extends Privilege {
  kind: "Privilege";
}

interface CASL_Setting extends Setting {
  kind: "Setting";
}

interface CASL_Flag {
  kind: "Flag";
  [key: string]: boolean | string;
}

export type Action = "create" | "view" | "update" | "delete";
export type Subject = InferSubjects<
  CASL_FormRecord | CASL_User | CASL_Privilege | CASL_Setting | CASL_Flag
>;

export type Abilities = [Action, Subject];

export type Permission = {
  action: Action | Action[];
  subject: Extract<Subject, string> | Extract<Subject, string>[];
  conditions?: MongoQuery<AnyObject>;
};

export type Privilege = PrismaPrivilege & {
  permissions: Permission[];
  [key: string]: string | null | Permission[] | number | undefined;
};

export type UserAbility = MongoAbility & {
  userID: string;
};

export type AnyObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export interface ForcedSubjectType {
  type: Extract<Subject, string>;
  object: Record<string, unknown>;
}
