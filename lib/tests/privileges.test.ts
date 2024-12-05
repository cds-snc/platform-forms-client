/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  interpolatePermissionCondition,
  authorizationCheck,
  createAbility,
  AccessControlError,
} from "@lib/privileges";
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

const mockedCheckOne = checkOne as jest.MockedFunction<typeof checkOne>;

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
      },
    ],
  },
};

describe("authorizationCheck", () => {
  describe("Base permissions", () => {
    beforeAll(() => {
      user1.session.user.privileges = mockUserPrivileges(Base, { user: { id: "1" } });
    });
    afterAll(() => {
      user1.session.user.privileges = mockUserPrivileges(Base, { user: { id: "1" } });
    });
    describe("Form Record", () => {
      describe("User can", () => {
        it("create a Form Record", async () => {
          const ability = createAbility(user1.session);

          await authorizationCheck(ability, [
            { action: "create", subject: { type: "FormRecord", scope: "all" } },
          ]);
        });
        it.each(["view", "update", "delete"])("%s Form Record they own", async (action) => {
          const ability = createAbility(user1.session);

          (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.formRecord
          );

          await authorizationCheck(ability, [
            {
              action: action as Action,
              subject: { type: "FormRecord", scope: { subjectId: user1.formRecord.id } },
            },
          ]);
        });
      });
      describe("User cannot", () => {
        it.each(["view", "update", "delete"])("%s Form Record they do not own", async (action) => {
          const ability = createAbility(user1.session);

          (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user2.formRecord
          );

          await expect(
            authorizationCheck(ability, [
              {
                action: action as Action,
                subject: { type: "FormRecord", scope: { subjectId: user2.formRecord.id } },
              },
            ])
          ).rejects.toThrow(AccessControlError);
        });

        it("publish a form", async () => {
          const ability = createAbility(user1.session);
          (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.formRecord
          );
          await expect(
            authorizationCheck(ability, [
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
          const ability = createAbility(user1.session);

          (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.db
          );

          await authorizationCheck(ability, [
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
          const ability = createAbility(user1.session);

          (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.db
          );

          await authorizationCheck(ability, [
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
          const ability = createAbility(user1.session);

          (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
            user1.db
          );

          await expect(
            authorizationCheck(ability, [
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
      });
    });
    describe("Setting", () => {
      describe("User cannot", () => {
        it.each(["create", "view", "update", "delete"])("perform %s action", async (action) => {
          const ability = createAbility(user1.session);

          await expect(
            authorizationCheck(ability, [
              { action: action as Action, subject: { type: "Setting", scope: "all" } },
            ])
          ).rejects.toThrow(AccessControlError);
        });
      });
    });
    describe("Privilege", () => {
      describe("User cannot", () => {
        it.each(["create", "view", "update", "delete"])("perform %s action", async (action) => {
          const ability = createAbility(user1.session);

          await expect(
            authorizationCheck(ability, [
              { action: action as Action, subject: { type: "Flag", scope: "all" } },
            ])
          ).rejects.toThrow(AccessControlError);
        });
      });
    });

    describe("Flag", () => {
      describe("User cannot", () => {
        it.each(["create", "view", "update", "delete"])("perform %s action", async (action) => {
          const ability = createAbility(user1.session);

          await expect(
            authorizationCheck(ability, [
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
    });
    afterAll(() => {
      user1.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: user1.session.user.id },
      });
    });
    describe("User can", () => {
      it("publish a form they own", async () => {
        const ability = createAbility(user1.session);

        (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
          user1.formRecord
        );

        await authorizationCheck(ability, [
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
        const ability = createAbility(user1.session);

        (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
          user2.formRecord
        );

        await expect(
          authorizationCheck(ability, [
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
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it.each(["create", "view", "update", "delete"])("%s Form Record", async (action) => {
        const ability = createAbility(adminUser.session);

        await authorizationCheck(ability, [
          { action: action as Action, subject: { type: "FormRecord", scope: "all" } },
        ]);
      });

      it.each(["view", "update", "delete"])("%s another users form record", async (action) => {
        const ability = createAbility(adminUser.session);
        (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
          user1.formRecord
        );
        await authorizationCheck(ability, [
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
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it("view all Users", async () => {
        const ability = createAbility(adminUser.session);

        await authorizationCheck(ability, [
          { action: "view", subject: { type: "User", scope: "all" } },
        ]);
      });

      it("view any user", async () => {
        const ability = createAbility(adminUser.session);
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await authorizationCheck(ability, [
          {
            action: "view",
            subject: { type: "User", scope: { subjectId: user1.session.user.id } },
          },
        ]);
      });

      it("view all Privileges", async () => {
        const ability = createAbility(adminUser.session);

        await authorizationCheck(ability, [
          { action: "view", subject: { type: "Privilege", scope: "all" } },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["update", "delete"])("%s a User", async (action) => {
        const ability = createAbility(adminUser.session);

        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await expect(
          authorizationCheck(ability, [
            {
              action: action as Action,
              subject: { type: "User", scope: { subjectId: user1.session.user.id } },
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
      it.each(["create", "update", "delete"])("%s a privilege", async (action) => {
        const ability = createAbility(adminUser.session);

        (prismaMock.privilege.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });

        await expect(
          authorizationCheck(ability, [
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
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it.each(["view", "update"])("%s any User", async (action) => {
        const ability = createAbility(adminUser.session);
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await authorizationCheck(ability, [
          {
            action: action as Action,
            subject: { type: "User", scope: { subjectId: user1.session.user.id } },
          },
        ]);
      });
      it("View any privilege", async () => {
        const ability = createAbility(adminUser.session);

        await authorizationCheck(ability, [
          { action: "view", subject: { type: "Privilege", scope: "all" } },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["create", "delete"])("%s a User", async (action) => {
        const ability = createAbility(adminUser.session);
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await expect(
          authorizationCheck(ability, [
            {
              action: action as Action,
              subject: { type: "User", scope: { subjectId: user1.session.user.id } },
            },
          ])
        ).rejects.toThrow(AccessControlError);
      });
      it.each(["create", "update", "delete"])("%s a Privilege", async (action) => {
        const ability = createAbility(adminUser.session);
        (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(user1.db);

        await expect(
          authorizationCheck(ability, [
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
    });
    afterAll(() => {
      adminUser.session.user.privileges = mockUserPrivileges(Base, {
        user: { id: adminUser.session.user.id },
      });
    });
    describe("User can", () => {
      it("view all Flags", async () => {
        const ability = createAbility(adminUser.session);

        await authorizationCheck(ability, [
          { action: "view", subject: { type: "Flag", scope: "all" } },
        ]);
      });
      it("can view any Flag", async () => {
        const ability = createAbility(adminUser.session);

        mockedCheckOne.mockResolvedValue(true);

        await authorizationCheck(ability, [
          { action: "view", subject: { type: "Flag", scope: { subjectId: "test" } } },
        ]);
      });
      it("view all Settings", async () => {
        const ability = createAbility(adminUser.session);

        await authorizationCheck(ability, [
          { action: "view", subject: { type: "Setting", scope: "all" } },
        ]);
      });
      it("can view any Setting", async () => {
        const ability = createAbility(adminUser.session);
        (prismaMock.setting.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });
        await authorizationCheck(ability, [
          {
            action: "view",
            subject: { type: "Setting", scope: { subjectId: "1" } },
          },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["create", "update", "delete"])("%s a Flag", async (action) => {
        const ability = createAbility(adminUser.session);
        mockedCheckOne.mockResolvedValue(true);
        await expect(
          authorizationCheck(ability, [
            { action: action as Action, subject: { type: "Flag", scope: { subjectId: "test" } } },
          ])
        ).rejects.toThrow(AccessControlError);
      });
      it.each(["create", "update", "delete"])("%s a Setting", async (action) => {
        const ability = createAbility(adminUser.session);
        (prismaMock.setting.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });
        await expect(
          authorizationCheck(ability, [
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
        const ability = createAbility(adminUser.session);
        mockedCheckOne.mockResolvedValue(true);
        await authorizationCheck(ability, [
          { action: action as Action, subject: { type: "Flag", scope: { subjectId: "test" } } },
        ]);
      });
      it("create any Setting", async () => {
        const ability = createAbility(adminUser.session);

        await authorizationCheck(ability, [
          { action: "create", subject: { type: "Setting", scope: "all" } },
        ]);
      });
      it.each(["view", "update", "delete"])("%s any Setting", async (action) => {
        const ability = createAbility(adminUser.session);
        (prismaMock.setting.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue({
          id: "1",
        });
        await authorizationCheck(ability, [
          {
            action: action as Action,
            subject: { type: "Setting", scope: { subjectId: "1" } },
          },
        ]);
      });
    });
    describe("User cannot", () => {
      it.each(["create", "delete"])("%s a Flag", async (action) => {
        const ability = createAbility(adminUser.session);
        mockedCheckOne.mockResolvedValue(true);
        await expect(
          authorizationCheck(ability, [
            { action: action as Action, subject: { type: "Flag", scope: { subjectId: "test" } } },
          ])
        ).rejects.toThrow(AccessControlError);
      });
    });
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
