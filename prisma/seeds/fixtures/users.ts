import { User } from "@prisma/client";

type UserCollection = {
  test: User[];
  [key: string]: Array<User | { privileges: Record<string, unknown> }>;
};

const RegularUser: User | { privileges: Record<string, unknown> } = {
  name: "Regular Test User",
  email: "test.user@cds-snc.ca",
  active: true,
  privileges: {
    connect: [{ nameEn: "Base" }, { nameEn: "PublishForms" }],
  },
};

const AdminUser: User | { privileges: Record<string, unknown> } = {
  name: "Admin Test User",
  email: "test.admin@cds-snc.ca",
  active: true,
  privileges: {
    connect: [
      { nameEn: "Base" },
      { nameEn: "PublishForms" },
      { nameEn: "ManageApplicationSettings" },
      { nameEn: "ManageUsers" },
      { nameEn: "ManageForms" },
      { nameEn: "ManagePrivileges" },
    ],
  },
};

const DeactivatedRegularUser: User | { privileges: Record<string, unknown> } = {
  name: "Deactivated Test User",
  email: "test.deactivated@cds-snc.ca",
  active: false,
  privileges: {
    connect: [{ nameEn: "Base" }, { nameEn: "PublishForms" }],
  },
};

export default {
  test: [RegularUser, AdminUser, DeactivatedRegularUser],
} as UserCollection;
