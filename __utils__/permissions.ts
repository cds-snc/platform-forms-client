import { AppAbility } from "@lib/policyBuilder";
import { RawRuleOf } from "@casl/ability";
import { interpolatePermissionCondition } from "@lib/policyBuilder";

type AnyObject = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const Base: RawRuleOf<AppAbility>[] = [
  { action: "create", subject: "FormRecord" },
  {
    action: ["view", "update", "delete"],
    subject: "FormRecord",
    conditions: { users: { $elemMatch: { id: "${user.id}" } } },
  },
  { action: "update", subject: "FormRecord", fields: ["publishingStatus"], inverted: true },
  {
    action: "delete",
    subject: "FormRecord",
    conditions: { publishingStatus: true },
    inverted: true,
  },
];

export const PublishForms: RawRuleOf<AppAbility>[] = [
  {
    action: ["update"],
    subject: "FormRecord",
    fields: ["publishingStatus"],
    conditions: { users: { $elemMatch: { id: "${user.id}" } } },
  },
];

export const ManageForms: RawRuleOf<AppAbility>[] = [
  { action: ["create", "view", "update", "delete"], subject: "FormRecord" },
];

export const ViewUserPrivileges: RawRuleOf<AppAbility>[] = [
  {
    action: "view",
    subject: ["User", "Privilege"],
  },
];

export const ManageUsers: RawRuleOf<AppAbility>[] = [
  { action: "view", subject: ["User", "Privilege"] },
  { action: "update", subject: "User" },
];

export const ManagePrivileges: RawRuleOf<AppAbility>[] = [
  { action: ["create", "view", "update", "delete"], subject: "Privilege" },
];

export const ViewApplicationSettings: RawRuleOf<AppAbility>[] = [
  { action: "view", subject: "Flag" },
];

export const ManageApplicationSettings: RawRuleOf<AppAbility>[] = [
  { action: "view", subject: "Flag" },
  { action: "update", subject: "Flag" },
];

export const getUserPrivileges = (permissionSet: RawRuleOf<AppAbility>[], values: AnyObject) => {
  return permissionSet.map((p) => {
    return p.conditions
      ? {
          ...p,
          conditions: interpolatePermissionCondition(p.conditions, values),
        }
      : p;
  });
};
