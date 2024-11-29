/* eslint-disable @typescript-eslint/no-explicit-any */
import { interpolatePermissionCondition, authorizationCheck, createAbility } from "@lib/privileges";
import {
  Base,
  mockUserPrivileges,
  ManageForms,
  ManageUsers,
  PublishForms,
  ViewUserPrivileges,
} from "__utils__/permissions";
import { Session } from "next-auth";
import { prismaMock } from "@jestUtils";

const publishedFormRecord = {
  id: "111111",
  created_at: Date.now() - 86400,
  updated_at: Date.now() - 43200,
  name: "Test Form",
  isPublished: true,
  users: [
    {
      id: "0",
      name: "Test User",
      email: "test.user@cds-snc.ca",
      active: true,
    },
    {
      id: "1",
      name: "Test User 2",
      email: "test.user2@cds-snc.ca",
      active: true,
    },
  ],
};
const unpublishedFormRecord = {
  id: "222222",
  created_at: Date.now() - 86400,
  updated_at: Date.now() - 43200,
  name: "Test Form",
  isPublished: true,
  users: [
    {
      id: "0",
      name: "Test User",
      email: "test.user@cds-snc.ca",
      active: true,
    },
  ],
};

const user = {
  id: "0",
  name: "Test User",
  email: "test.user@cds-snc.ca",
  lastLogin: Date.now() - 3600,
  active: true,
};

describe("authorizationCheck", () => {
  describe("Base permissions", () => {
    it("Should not throw if the user has permission to create a Form Record", async () => {
      const fakeSession = {
        user: { id: "1", privileges: mockUserPrivileges(Base, { user: { id: "0" } }) },
      };
      const ability = createAbility(fakeSession as Session);

      await authorizationCheck(ability, [
        { action: "create", subject: { type: "FormRecord", scope: "all" } },
      ]);
    });
    it("Should not throw if the user has permission to view Form Record", async () => {
      const fakeSession = {
        user: { id: "1", privileges: mockUserPrivileges(Base, { user: { id: "0" } }) },
      };
      const ability = createAbility(fakeSession as Session);

      (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
        publishedFormRecord
      );

      await authorizationCheck(ability, [
        { action: "view", subject: { type: "FormRecord", scope: { subjectId: "111111" } } },
      ]);
    });
    it("Should not throw if the user has permission to edit Form Record", async () => {
      const fakeSession = {
        user: { id: "1", privileges: mockUserPrivileges(Base, { user: { id: "0" } }) },
      };
      const ability = createAbility(fakeSession as Session);

      (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
        publishedFormRecord
      );

      await authorizationCheck(ability, [
        { action: "update", subject: { type: "FormRecord", scope: { subjectId: "111111" } } },
      ]);
    });
    it("Should not throw if the user has permission to delete Form Record", async () => {
      const fakeSession = {
        user: { id: "1", privileges: mockUserPrivileges(Base, { user: { id: "0" } }) },
      };
      const ability = createAbility(fakeSession as Session);

      (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
        publishedFormRecord
      );

      await authorizationCheck(ability, [
        { action: "delete", subject: { type: "FormRecord", scope: { subjectId: "111111" } } },
      ]);
    });

    it("Should throw if the user does not has permission", async () => {
      const fakeSession = {
        user: { id: "1", privileges: mockUserPrivileges(Base, { user: { id: "bad" } }) },
      };
      const ability = createAbility(fakeSession as Session);

      (prismaMock.template.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValue(
        publishedFormRecord
      );

      expect(async () =>
        authorizationCheck(ability, [
          { action: "update", subject: { type: "FormRecord", scope: { subjectId: "111111" } } },
        ])
      ).rejects.toThrow("Access Control Forbidden Action");
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
