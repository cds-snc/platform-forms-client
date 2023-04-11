import { interpolatePermissionCondition } from "@lib/privileges";
import { Abilities } from "@lib/types/privileges-types";
import { RawRuleOf, MongoAbility } from "@casl/ability";

type AnyObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const Base: RawRuleOf<MongoAbility<Abilities>>[] = [
  { action: "create", subject: "FormRecord" },
  {
    action: ["view", "update", "delete"],
    subject: "FormRecord",
    conditions: { users: { $elemMatch: { id: "${user.id}" } } },
  },
  { action: "update", subject: "FormRecord", fields: ["isPublished"], inverted: true },
];

export const PublishForms: RawRuleOf<MongoAbility<Abilities>>[] = [
  {
    action: ["update"],
    subject: "FormRecord",
    fields: ["isPublished"],
    conditions: { users: { $elemMatch: { id: "${user.id}" } } },
  },
];

export const ManageForms: RawRuleOf<MongoAbility<Abilities>>[] = [
  { action: ["create", "view", "update", "delete"], subject: "FormRecord" },
];

export const ViewUserPrivileges: RawRuleOf<MongoAbility<Abilities>>[] = [
  {
    action: "view",
    subject: ["User", "Privilege"],
  },
];

export const ManageUsers: RawRuleOf<MongoAbility<Abilities>>[] = [
  { action: "view", subject: ["User", "Privilege"] },
  { action: "update", subject: "User" },
];

export const ManagePrivileges: RawRuleOf<MongoAbility<Abilities>>[] = [
  { action: ["create", "view", "update", "delete"], subject: "Privilege" },
];

export const ViewApplicationSettings: RawRuleOf<MongoAbility<Abilities>>[] = [
  { action: "view", subject: "Flag" },
  { action: "view", subject: "Setting" },
];

export const ManageApplicationSettings: RawRuleOf<MongoAbility<Abilities>>[] = [
  { action: "view", subject: "Flag" },
  { action: "update", subject: "Flag" },
  { action: ["create", "view", "update", "delete"], subject: "Setting" },
];

export const mockUserPrivileges = (
  permissionSet: RawRuleOf<MongoAbility<Abilities>>[],
  values: AnyObject
) => {
  return permissionSet.map((p) => {
    return p.conditions
      ? {
          ...p,
          conditions: interpolatePermissionCondition(p.conditions, values),
        }
      : p;
  });
};
