import { Privilege } from "@prisma/client";

type PrivilegeSeed = Omit<Privilege, "id">;
type PrivilegeCollection = {
  development: PrivilegeSeed[];
  production: PrivilegeSeed[];
  [key: string]: PrivilegeSeed[];
};

const Base: PrivilegeSeed = {
  name: "Base",
  descriptionEn: "Base Permissions",
  descriptionFr: "Autorisations de Base",
  permissions: [
    { action: "create", subject: "FormRecord" },
    {
      action: ["view", "update", "delete"],
      subject: "FormRecord",
      conditions: { users: { $elemMatch: { id: "${user.id}" } } },
    },
    { action: "update", subject: "FormRecord", fields: ["isPublished"], inverted: true },
    {
      action: ["create", "view", "update"],
      subject: "User",
      fields: ["securityAnswers", "name"],
      conditions: { id: "${user.id}" },
    },
  ],
  priority: 0,
};

const PublishForms: PrivilegeSeed = {
  name: "PublishForms",
  descriptionEn: "Permission to Publish a Form",
  descriptionFr: "Autorisation de publier un formulaire",
  permissions: [
    {
      action: ["update"],
      subject: "FormRecord",
      fields: ["isPublished"],
      conditions: { users: { $elemMatch: { id: "${user.id}" } } },
    },
  ],
  priority: 1,
};

const ManageForms: PrivilegeSeed = {
  name: "ManageForms",
  descriptionEn: "Permission to manage all Forms",
  descriptionFr: "Autorisation de gérer tous les formulaires",
  permissions: [{ action: ["create", "view", "update", "delete"], subject: "FormRecord" }],
  priority: 2,
};

const ViewUserPrivileges: PrivilegeSeed = {
  name: "ViewUserPrivileges",
  descriptionEn: "Permission to view user privileges",
  descriptionFr: "Autorisation d''afficher les privilèges de l''utilisateurs",
  permissions: [
    {
      action: "view",
      subject: ["User", "Privilege"],
    },
  ],
  priority: 2,
};

const ManageUsers: PrivilegeSeed = {
  name: "ManageUsers",
  descriptionEn: "Permission to manage users",
  descriptionFr: "Autorisation de gérer les utilisateurs",
  permissions: [
    { action: "view", subject: ["User", "Privilege"] },
    { action: "update", subject: "User" },
  ],
  priority: 3,
};

const ViewApplicationSettings: PrivilegeSeed = {
  name: "ViewApplicationSettings",
  descriptionEn: "Permission to view application settings",
  descriptionFr: "Autorisation d''afficher les paramètres de l''application",
  permissions: [
    { action: "view", subject: "Flag" },
    { action: "view", subject: "Setting" },
  ],
  priority: 4,
};

const ManageApplicationSettings: PrivilegeSeed = {
  name: "ManageApplicationSettings",
  descriptionEn: "Permission to manage application settings",
  descriptionFr: "Autorisation de gérer les paramètres de l''application",
  permissions: [
    { action: "view", subject: "Flag" },
    { action: "update", subject: "Flag" },
    { action: ["create", "view", "update", "delete"], subject: "Setting" },
  ],
  priority: 5,
};

const allLivePrivileges = [
  Base,
  PublishForms,
  ManageForms,
  ViewUserPrivileges,
  ManageUsers,
  ViewApplicationSettings,
  ManageApplicationSettings,
];

export default {
  development: [...allLivePrivileges],
  production: [...allLivePrivileges],
  test: [...allLivePrivileges],
} as PrivilegeCollection;
