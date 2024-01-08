type UserCollection = {
  test: SeedUser[];
  [key: string]: Array<SeedUser>;
};

type SeedUser = {
  name: string;
  email: string;
  active: boolean;
  privileges: Record<string, unknown>;
};

const RegularUser: SeedUser = {
  name: "Regular Test User",
  email: "test.user@cds-snc.ca",
  active: true,
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

const AdminUser: SeedUser = {
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

const DeactivatedRegularUser: SeedUser = {
  name: "Deactivated Test User",
  email: "test.deactivated@cds-snc.ca",
  active: false,
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

export const UserWithoutSecurityAnswers: Omit<SeedUser, "active"> = {
  name: "Test User Without Scurity Answers",
  email: "test.withoutSecurityAnswers@cds-snc.ca",
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

export default {
  test: [RegularUser, AdminUser, DeactivatedRegularUser],
} as UserCollection;
