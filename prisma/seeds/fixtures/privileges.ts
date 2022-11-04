import { Privilege } from "@prisma/client";

type PrivilegeSeed = Omit<Privilege, "id">;
type PrivilegeCollection = {
  development: PrivilegeSeed[];
  production: PrivilegeSeed[];
  [key: string]: PrivilegeSeed[];
};

const Base: PrivilegeSeed = {
  nameEn: "Base",
  nameFr: "Base",
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
  ],
  priority: 0,
};

const PublishForms: PrivilegeSeed = {
  nameEn: "PublishForms",
  nameFr: "PublierLesFormulaires",
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
  nameEn: "ManageForms",
  nameFr: "GérerLesFormulaires",
  descriptionEn: "Permission to manage all Forms",
  descriptionFr: "Autorisation de gérer tous les formulaires",
  permissions: [{ action: ["create", "view", "update", "delete"], subject: "FormRecord" }],
  priority: 2,
};

const ViewUserPrivileges: PrivilegeSeed = {
  nameEn: "ViewUserPrivileges",
  nameFr: "VisionnerPrivilègesUtilisateur",
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
  nameEn: "ManageUsers",
  nameFr: "GérerUtilisateurs",
  descriptionEn: "Permission to manage users",
  descriptionFr: "Autorisation de gérer les utilisateurs",
  permissions: [
    { action: "view", subject: ["User", "Privilege"] },
    { action: "update", subject: "User" },
  ],
  priority: 3,
};

const ManagePrivileges: PrivilegeSeed = {
  nameEn: "ManagePrivileges",
  nameFr: "GérerPrivilèges",
  descriptionEn: "Permission to manage privileges",
  descriptionFr: "Autorisation de gérer les privilèges",
  permissions: [{ action: ["create", "view", "update", "delete"], subject: "Privilege" }],
  priority: 4,
};

const ViewApplicationSettings: PrivilegeSeed = {
  nameEn: "ViewApplicationSettings",
  nameFr: "VisionnerParamètresApplication",
  descriptionEn: "Permission to view application settings",
  descriptionFr: "Autorisation d''afficher les paramètres de l''application",
  permissions: [{ action: "view", subject: "Flag" }],
  priority: 4,
};

const ManageApplicationSettings: PrivilegeSeed = {
  nameEn: "ManageApplicationSettings",
  nameFr: "GérerParamètresApplication",
  descriptionEn: "Permission to manage application settings",
  descriptionFr: "Autorisation de gérer les paramètres de l''application",
  permissions: [
    { action: "view", subject: "Flag" },
    { action: "update", subject: "Flag" },
  ],
  priority: 5,
};

export default {
  development: [
    Base,
    PublishForms,
    ManageForms,
    ViewUserPrivileges,
    ManageUsers,
    ManagePrivileges,
    ViewApplicationSettings,
    ManageApplicationSettings,
  ],
  production: [
    Base,
    PublishForms,
    ManageForms,
    ViewUserPrivileges,
    ManageUsers,
    ManagePrivileges,
    ViewApplicationSettings,
    ManageApplicationSettings,
  ],
} as PrivilegeCollection;
