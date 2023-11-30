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
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

const AdminUser: User | { privileges: Record<string, unknown> } = {
  name: "Admin Test User",
  email: "test.admin@cds-snc.ca",
  active: true,
  privileges: {
    connect: [
      { name: "Base" },
      { name: "PublishForms" },
      { name: "ManageApplicationSettings" },
      { name: "ManageUsers" },
      { name: "ManageForms" },
    ],
  },
};

const DeactivatedRegularUser: User | { privileges: Record<string, unknown> } = {
  name: "Deactivated Test User",
  email: "test.deactivated@cds-snc.ca",
  active: false,
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

export const UserWithoutSecurityAnswers: User | { privileges: Record<string, unknown> } = {
  name: "Test User Without Scurity Answers",
  email: "test.withoutSecurityAnswers@cds-snc.ca",
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

export default {
  test: [RegularUser, AdminUser, DeactivatedRegularUser],
} as UserCollection;
