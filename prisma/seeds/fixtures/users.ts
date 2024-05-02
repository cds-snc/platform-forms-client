interface CreateAppUser {
  email: string;
  name: string;
  active?: boolean;
  privileges: Record<string, unknown>;
}

type UserCollection = {
  test: CreateAppUser[];
  [key: string]: Array<CreateAppUser>;
};

const RegularUser: CreateAppUser = {
  name: "Regular Test User",
  email: "test.user@cds-snc.ca",
  active: true,
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

const AdminUser: CreateAppUser = {
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

const DeactivatedRegularUser: CreateAppUser = {
  name: "Deactivated Test User",
  email: "test.deactivated@cds-snc.ca",
  active: false,
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

export const UserWithoutSecurityAnswers: CreateAppUser = {
  name: "Test User Without Scurity Answers",
  email: "test.withoutSecurityAnswers@cds-snc.ca",
  privileges: {
    connect: [{ name: "Base" }, { name: "PublishForms" }],
  },
};

export default {
  test: [RegularUser, AdminUser, DeactivatedRegularUser],
} as UserCollection;
