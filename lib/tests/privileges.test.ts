/* eslint-disable @typescript-eslint/no-explicit-any */
import { interpolatePermissionCondition, authorization } from "@lib/privileges";
import { AccessControlError, auth } from "@lib/auth";
import {
  Base,
  mockUserPrivileges,
  ManageForms,
  ManageUsers,
  PublishForms,
  ViewUserPrivileges,
  ViewApplicationSettings,
  ManageApplicationSettings,
} from "__utils__/permissions";
import { Session } from "next-auth";
import { prismaMock } from "@jestUtils";
import { User } from "@prisma/client";
import { Action } from "@lib/types/privileges-types";
import { checkOne } from "@lib/cache/flags";

jest.mock("@lib/cache/flags");
jest.mock("@lib/auth", () => {
  const originalModule = jest.requireActual("@lib/auth");
  return {
    ...originalModule,
    auth: jest.fn(),
  };
});

const mockedCheckOne = checkOne as jest.MockedFunction<typeof checkOne>;
const mockedAuth = auth as unknown as jest.MockedFunction<() => Promise<Session | null>>;

type TestUser = {
  session: Session;
  db: User;
  formRecord: {
    id: string;
    created_at: Date;
    updated_at: Date;
    name: string;
    isPublished: boolean;
    users: User[];
  };
};

const user1: TestUser = {
  session: {
    user: {
      id: "1",
      name: "Test User",
      email: "test.user@cds-snc.ca",
      privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
      acceptableUse: true,
      hasSecurityQuestions: true,
    },
    expires: (Date.now() + 3600).toString(),
  },
  db: {
    id: "1",
    name: "Test User",
    email: "test.user@cds-snc.ca",
    lastLogin: new Date(Date.now() - 3600),
    active: true,
    image: null,
    emailVerified: null,
    createdAt: new Date(Date.now() - 86400),
  },
  formRecord: {
    id: "222222",
    created_at: new Date(Date.now() - 86400),
    updated_at: new Date(Date.now() - 43200),
    name: "Test Form",
    isPublished: true,
    users: [
      {
        id: "1",
        name: "Test User",
        email: "test.user@cds-snc.ca",
        active: true,
        image: null,
        emailVerified: null,
        lastLogin: new Date(Date.now() - 3600),
        createdAt: new Date(Date.now() - 86400),
      },
    ],
  },
};

const user2: TestUser = {
  session: {
    user: {
      id: "2",
      name: "Test User 2",
      email: "test.user.2@cds-snc.ca",
      privileges: mockUserPrivileges(Base, { user: { id: "2" } }),
      acceptableUse: true,
      hasSecurityQuestions: true,
    },
    expires: (Date.now() + 3600).toString(),
  },
  db: {
    id: "2",
    name: "Test User 2",
    email: "test.user.2@cds-snc.ca",
    lastLogin: new Date(Date.now() - 3600),
    active: true,
    image: null,
    emailVerified: null,
    createdAt: new Date(Date.now() - 86400),
  },
  formRecord: {
    id: "333333",
    created_at: new Date(Date.now() - 86400),
    updated_at: new Date(Date.now() - 43200),
    name: "Test Form",
    isPublished: true,
    users: [
      {
        id: "2",
        name: "Test User 2",
        email: "test.user.2@cds-snc.ca",
        active: true,
        image: null,
        emailVerified: null,
        lastLogin: new Date(Date.now() - 3600),
        createdAt: new Date(Date.now() - 86400),
      },
    ],
  },
};

// Admin user needs elevated privileges added adhoc in tests
const adminUser: TestUser = {
  session: {
    user: {
      id: "3",
      name: "Admin User",
      email: "admin.user@cds-snc.ca",
      privileges: mockUserPrivileges(Base, { user: { id: "3" } }),
      acceptableUse: true,
      hasSecurityQuestions: true,
    },
    expires: (Date.now() + 3600).toString(),
  },
  db: {
    id: "3",
    name: "Admin User",
    email: "admin.user@cds-snc.ca",
    lastLogin: new Date(Date.now() - 3600),
    active: true,
    image: null,
    emailVerified: null,
    createdAt: new Date(Date.now() - 86400),
  },
  formRecord: {
    id: "444444",
    created_at: new Date(Date.now() - 86400),
    updated_at: new Date(Date.now() - 43200),
    name: "Test Admin Form",
    isPublished: false,
    users: [
      {
        id: "3",
        name: "Admin User",
        email: "admin.user@cds-snc.ca",
        active: true,
        image: null,
        emailVerified: null,
        lastLogin: new Date(Date.now() - 3600),
        createdAt: new Date(Date.now() - 86400),
      },
    ],
  },
};

describe("Privilege Checks", () => {
  describe("Base permissions", () => {
    beforeAll(() => {
      user1.session.user.privileges = mockUserPrivileges(Base, { user: { id: "1" } });
      mockedAuth.mockResolvedValue(user1.session);
    });
    afterAll(() => {
      user1.session.user.privileges = mockUserPrivileges(Base, { user: { id: "1" } });
    });
    describe("Form Record", () => {
      describe("User can", () => {
        it("create a Form Record", async () => {
          await authorization.check([
            { action: "create", subject: { type: "FormRecord", scope: "all" } },
          ]);
        });
        it.each(["view", "update", "delete"])("%s Form Record they own", async (action) => {
          (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.formRecord
          );

          await authorization.check([
            {
              action: action as Action,
              subject: { type: "FormRecord", scope: { subjectId: user1.formRecord.id } },
            },
          ]);
        });
      });
      describe("User cannot", () => {
        it.each(["view", "update", "delete"])("%s Form Record they do not own", async (action) => {
          (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user2.formRecord
          );

          await expect(
            authorization.check([
              {
                action: action as Action,
                subject: { type: "FormRecord", scope: { subjectId: user2.formRecord.id } },
              },
            ])
          ).rejects.toThrow(AccessControlError);
        });

        it("publish a form", async () => {
          (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.formRecord
          );
          await expect(
            authorization.check([
              {
                action: "update",
                subject: {
                  type: "FormRecord",
                  scope: { subjectId: user1.formRecord.id },
                },
                fields: ["isPublished"],
              },
            ])
          ).rejects.toThrow(AccessControlError);
        });
      });
    });
    describe("User", () => {
      describe("User can", () => {
        it("modify their own security questions", async () => {
          (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.db
          );

          await authorization.check([
            {
              action: "update",
              subject: {
                type: "User",
                scope: { subjectId: user1.session.user.id },
              },
              fields: ["securityAnswers"],
            },
          ]);
        });
        it("modify their own name", async () => {
          (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.db
          );

          await authorization.check([
            {
              action: "update",
              subject: {
                type: "User",
                scope: { subjectId: user1.session.user.id },
              },
              fields: ["name"],
            },
          ]);
        });
      });
      describe("User cannot", () => {
        it("modify email address", async () => {
          (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.db
          );

          await expect(
            authorization.check([
              {
                action: "update",
                subject: {
                  type: "User",
                  scope: { subjectId: user1.session.user.id },
                },
                fields: ["email"],
              },
            ])
          ).rejects.toThrow(AccessControlError);
        });
        it("modify another user", async () => {
          (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user2.db
          );

          await expect(
            authorization.check([
              {
                action: "update",
                subject: {
                  type: "User",
                  scope: { subjectId: user2.session.user.id },
                },
                fields: ["name"],
              },
            ])
          ).rejects.toThrow(AccessControlError);
        });
      });
    });
    describe("Setting", () => {
      describe("User cannot", () => {
        it.each(["create", "view", "update", "delete"])("perform %s action", async (action) => {
          await expect(
            authorization.check([
              { action: action as Action, subject: { type: "Setting", scope: "all" } },
            ])
          ).rejects.toThrow(AccessControlError);
        });
      });
    });
    describe("Privilege", () => {
      describe("User cannot", () => {
        it.each(["create", "view", "update", "delete"])("perform %s action", async (action) => {
          await expect(
            authorization.check([
              { action: action as Action, subject: { type: "Flag", scope: "all" } },
            ])
          ).rejects.toThrow(AccessControlError);
        });
      });
    });

    describe("Flag", () => {
      describe("User cannot", () => {
        it.each(["create", "view", "update", "delete"])("perform %s action", async (action) => {
          await expect(
            authorization.check([
              { action: action as Action, subject: { type: "Flag", scope: "all" } },
            ])
          ).rejects.toThrow(AccessControlError);
        });
      });
    });
  });
  describe("PublishForms permissions", () => {
    beforeAll(() => {
      user1.session.user.privileges = mockUserPrivileges(PublishForms, {
        user: { id: user1.session.user.id },
      });
      mockedAuth.mockResolvedValue(user1.session);
    });
    afterAll(() => {
      user1.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: user1.session.user.id },
      });
    });
    describe("User can", () => {
      it("publish a form they own", async () => {
        (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
          user1.formRecord
        );

        await authorization.check([
          {
            action: "update",
            subject: {
              type: "FormRecord",
              scope: { subjectId: user1.formRecord.id },
            },
            fields: ["isPublished"],
          },
        ]);
      });
    });
    describe("User cannot", () => {
      it("publish a form they do not own", async () => {
        (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
          user2.formRecord
        );

        await expect(
          authorization.check([
            {
              action: "update",
              subject: {
                type: "FormRecord",
                scope: { subjectId: user2.formRecord.id },
              },
              fields: ["isPublished"],
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
    });
  });
  describe(" ManageForms permissions", () => {
    beforeAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(ManageForms, {
        user: { id: adminUser.session.user.id },
      });
      mockedAuth.mockResolvedValue(adminUser.session);
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it.each(["create", "view", "update", "delete"])("%s Form Record", async (action) => {
        await authorization.check([
          { action: action as Action, subject: { type: "FormRecord", scope: "all" } },
        ]);
      });

      it.each(["view", "update", "delete"])("%s another users form record", async (action) => {
        (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
          user1.formRecord
        );
        await authorization.check([
          {
            action: action as Action,
            subject: { type: "FormRecord", scope: { subjectId: user1.formRecord.id } },
          },
        ]);
      });
    });
  });
  describe("ViewUserPrivileges permissions", () => {
    beforeAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(ViewUserPrivileges, {
        user: { id: adminUser.session.user.id },
      });
      mockedAuth.mockResolvedValue(adminUser.session);
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it("view all Users", async () => {
        await authorization.check([{ action: "view", subject: { type: "User", scope: "all" } }]);
      });

      it("view any user", async () => {
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await authorization.check([
          {
            action: "view",
            subject: { type: "User", scope: { subjectId: user1.session.user.id } },
          },
        ]);
      });

      it("view all Privileges", async () => {
        await authorization.check([
          { action: "view", subject: { type: "Privilege", scope: "all" } },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["update", "delete"])("%s a User", async (action) => {
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await expect(
          authorization.check([
            {
              action: action as Action,
              subject: { type: "User", scope: { subjectId: user1.session.user.id } },
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
      it.each(["create", "update", "delete"])("%s a privilege", async (action) => {
        (prismaMock.privilege.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });

        await expect(
          authorization.check([
            {
              action: action as Action,
              subject: { type: "Privilege", scope: { subjectId: "1" } },
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
    });
  });
  describe("ManageUsers permissions", () => {
    beforeAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(ManageUsers, {
        user: { id: adminUser.session.user.id },
      });
      mockedAuth.mockResolvedValue(adminUser.session);
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it.each(["view", "update"])("%s any User", async (action) => {
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await authorization.check([
          {
            action: action as Action,
            subject: { type: "User", scope: { subjectId: user1.session.user.id } },
          },
        ]);
      });
      it("View any privilege", async () => {
        await authorization.check([
          { action: "view", subject: { type: "Privilege", scope: "all" } },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["create", "delete"])("%s a User", async (action) => {
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await expect(
          authorization.check([
            {
              action: action as Action,
              subject: { type: "User", scope: { subjectId: user1.session.user.id } },
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
      it.each(["create", "update", "delete"])("%s a Privilege", async (action) => {
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await expect(
          authorization.check([
            {
              action: action as Action,
              subject: { type: "Privilege", scope: { subjectId: user1.session.user.id } },
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
    });
  });
  describe("ViewApplicationSettings permissions", () => {
    beforeAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(ViewApplicationSettings, {
        user: { id: adminUser.session.user.id },
      });
      mockedAuth.mockResolvedValue(adminUser.session);
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it("view all Flags", async () => {
        await authorization.check([{ action: "view", subject: { type: "Flag", scope: "all" } }]);
      });
      it("can view any Flag", async () => {
        mockedCheckOne.mockResolvedValue(true);

        await authorization.check([
          { action: "view", subject: { type: "Flag", scope: { subjectId: "test" } } },
        ]);
      });
      it("view all Settings", async () => {
        await authorization.check([{ action: "view", subject: { type: "Setting", scope: "all" } }]);
      });
      it("can view any Setting", async () => {
        (prismaMock.setting.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });
        await authorization.check([
          {
            action: "view",
            subject: { type: "Setting", scope: { subjectId: "1" } },
          },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["create", "update", "delete"])("%s a Flag", async (action) => {
        mockedCheckOne.mockResolvedValue(true);
        await expect(
          authorization.check([
            { action: action as Action, subject: { type: "Flag", scope: { subjectId: "test" } } },
          ])
        ).rejects.toThrow(AccessControlError);
      });
      it.each(["create", "update", "delete"])("%s a Setting", async (action) => {
        (prismaMock.setting.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });
        await expect(
          authorization.check([
            {
              action: action as Action,
              subject: { type: "Setting", scope: { subjectId: "1" } },
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
    });
  });
  describe("ManageApplicationSettings permissions", () => {
    beforeAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(ManageApplicationSettings, {
        user: { id: adminUser.session.user.id },
      });
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it.each(["view", "update"])("%s any Flag", async (action) => {
        mockedAuth.mockResolvedValue(adminUser.session);
        mockedCheckOne.mockResolvedValue(true);
        await authorization.check([
          { action: action as Action, subject: { type: "Flag", scope: { subjectId: "test" } } },
        ]);
      });
      it("create any Setting", async () => {
        mockedAuth.mockResolvedValue(adminUser.session);

        await authorization.check([
          { action: "create", subject: { type: "Setting", scope: "all" } },
        ]);
      });
      it.each(["view", "update", "delete"])("%s any Setting", async (action) => {
        mockedAuth.mockResolvedValue(adminUser.session);
        (prismaMock.setting.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });
        await authorization.check([
          {
            action: action as Action,
            subject: { type: "Setting", scope: { subjectId: "1" } },
          },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["create", "delete"])("%s a Flag", async (action) => {
        mockedAuth.mockResolvedValue(adminUser.session);
        mockedCheckOne.mockResolvedValue(true);
        await expect(
          authorization.check([
            { action: action as Action, subject: { type: "Flag", scope: { subjectId: "test" } } },
          ])
        ).rejects.toThrow(AccessControlError);
      });
    });
  });
});

describe("Authorization Helpers", () => {
  beforeEach(() => {
    adminUser.session.user.privileges = mockUserPrivileges(Base, {
      user: { id: adminUser.session.user.id },
    });
    user1.session.user.privileges = mockUserPrivileges(Base, {
      user: { id: user1.session.user.id },
    });
    user2.session.user.privileges = mockUserPrivileges(Base, {
      user: { id: user2.session.user.id },
    });
  });
  describe("hasAdminstrationPrivileges", () => {
    beforeEach(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
      mockedAuth.mockResolvedValue(adminUser.session);
    });
    it.each([
      { priv: ManageUsers },
      { priv: ManageForms },
      { priv: ViewUserPrivileges },
      { priv: ViewApplicationSettings },
      { priv: ManageApplicationSettings },
    ])("should pass", async (set) => {
      adminUser.session.user.privileges = mockUserPrivileges(set.priv, {
        user: { id: adminUser.session.user.id },
      });

      await authorization.hasAdministrationPrivileges();
    });
    it.each([{ priv: Base }, { priv: PublishForms }])("should fail", async (set) => {
      adminUser.session.user.privileges = mockUserPrivileges(set.priv, {
        user: { id: adminUser.session.user.id },
      });

      await expect(authorization.hasAdministrationPrivileges()).rejects.toBeInstanceOf(
        AccessControlError
      );
    });
  });
  it("Can create Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    await authorization.canCreateForm();
  });
  it("Can view Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user1.formRecord
    );

    await authorization.canViewForm(user1.formRecord.id);
  });
  it("Can not view Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user2.formRecord
    );

    await expect(authorization.canViewForm(user2.formRecord.id)).rejects.toBeInstanceOf(
      AccessControlError
    );
  });
  it("Can Edit Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user1.formRecord
    );

    await authorization.canEditForm(user1.formRecord.id);
  });
  it("Can not Edit Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user2.formRecord
    );

    await expect(authorization.canEditForm(user2.formRecord.id)).rejects.toBeInstanceOf(
      AccessControlError
    );
  });
  it("Can Delete Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user1.formRecord
    );

    await authorization.canDeleteForm(user1.formRecord.id);
  });
  it("Can not Delete Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user2.formRecord
    );

    await expect(authorization.canDeleteForm(user2.formRecord.id)).rejects.toBeInstanceOf(
      AccessControlError
    );
  });
  it("Can Publish Form", async () => {
    user1.session.user.privileges = mockUserPrivileges(PublishForms, {
      user: { id: user1.session.user.id },
    });
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user1.formRecord
    );

    await authorization.canPublishForm(user1.formRecord.id);
  });
  it("Can not Publish Form", async () => {
    mockedAuth.mockResolvedValue(user1.session);

    (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
      user1.formRecord
    );

    await expect(authorization.canPublishForm(user1.formRecord.id)).rejects.toBeInstanceOf(
      AccessControlError
    );
  });
  it("Can View all Form Records", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ManageForms, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canViewAllForms();
  });
  it("Can not view all Forms", async () => {
    mockedAuth.mockResolvedValue(user1.session);
    await expect(authorization.canViewAllForms()).rejects.toBeInstanceOf(AccessControlError);
  });
  it("Can manage all Forms", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ManageForms, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canManageAllForms();
  });
  it("Can not manage all Form Records", async () => {
    mockedAuth.mockResolvedValue(user1.session);
    await expect(authorization.canManageAllForms()).rejects.toBeInstanceOf(AccessControlError);
  });
  it("Can manage users", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ManageUsers, {
      user: { id: adminUser.session.user.id },
    });
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canManageUser(user1.session.user.id);
  });
  it("Can not manage other users", async () => {
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);
    mockedAuth.mockResolvedValue(user2.session);
    await expect(authorization.canManageUser(user2.session.user.id)).rejects.toBeInstanceOf(
      AccessControlError
    );
  });
  it("Can update security question on user", async () => {
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);
    mockedAuth.mockResolvedValue(user1.session);
    await authorization.canUpdateSecurityQuestions(user1.session.user.id);
  });
  it("Can not update security questions on another user", async () => {
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);
    mockedAuth.mockResolvedValue(user2.session);
    await expect(
      authorization.canUpdateSecurityQuestions(user1.session.user.id)
    ).rejects.toBeInstanceOf(AccessControlError);
  });
  it("Can update name on user", async () => {
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);
    mockedAuth.mockResolvedValue(user1.session);
    await authorization.canChangeUserName(user1.session.user.id);
  });
  it("Can not update name on another user", async () => {
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);
    mockedAuth.mockResolvedValue(user2.session);
    await expect(authorization.canChangeUserName(user1.session.user.id)).rejects.toBeInstanceOf(
      AccessControlError
    );
  });
  it("Can manage all users", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ManageUsers, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canManageAllUsers();
  });
  it("Can access Flags", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ViewApplicationSettings, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canAccessFlags();
  });
  it("Can manage Flags", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ManageApplicationSettings, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canManageFlags();
  });
  it("Can access Settings", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ViewApplicationSettings, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canAccessSettings();
  });
  it("Can manage Settings", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ManageApplicationSettings, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canManageSettings();
  });
  it("Can access Privileges", async () => {
    adminUser.session.user.privileges = mockUserPrivileges(ViewUserPrivileges, {
      user: { id: adminUser.session.user.id },
    });
    mockedAuth.mockResolvedValue(adminUser.session);
    await authorization.canAccessPrivileges();
  });
});

describe("Provided values can be interpolated in permission condition", () => {
  it("Should succeed if condition does not require any interpolation", async () => {
    const condition = { "formConfig.something": false };

    const result = interpolatePermissionCondition(condition, {
      userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
    });

    const expectedResult = { "formConfig.something": false };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should succeed if condition requires one value to be interpolated", async () => {
    const condition = { userId: "${userId}" };

    const result = interpolatePermissionCondition(condition, {
      userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
    });

    const expectedResult = { userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9" };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should succeed if condition requires one nested value to be interpolated", async () => {
    const condition = { userId: "${objectX.profile.userId}" };

    const objectX = {
      profile: {
        userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      },
    };

    const result = interpolatePermissionCondition(condition, {
      objectX,
    });

    const expectedResult = { userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9" };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should succeed if condition requires multiple values to be interpolated", async () => {
    const condition = {
      userId: "${objectX.profile.userId}",
      userLocation: "${objectY.location}",
    };

    const objectX = {
      profile: {
        userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      },
    };

    const objectY = {
      location: "Montréal",
    };

    const result = interpolatePermissionCondition(condition, {
      objectX,
      objectY,
    });

    const expectedResult = {
      userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      userLocation: "Montréal",
    };

    expect(result).toMatchObject(expectedResult);
  });

  it("Should throw error if value to be interpolated is not provided", async () => {
    const condition = {
      userId: "${objectX.profile.userId}",
      userLocation: "${objectY.location}",
    };

    const objectX = {
      location: "Montréal",
    };

    expect(() => {
      interpolatePermissionCondition(condition, {
        objectX,
      });
    }).toThrowError(
      "Could not interpolate permission condition because of missing value (objectX.profile.userId)"
    );
  });

  it("Should throw error if object path is missing within placeholder", async () => {
    const condition = {
      userId: "${objectX.profile.userId}",
      userLocation: "${}",
    };

    const objectX = {
      profile: {
        userId: "1B712DD4-9263-41C2-AAA0-B0D4F430FEC9",
      },
    };

    expect(() => {
      interpolatePermissionCondition(condition, {
        objectX,
      });
    }).toThrowError("Could not find object path in permission condition placeholder");
  });
});
