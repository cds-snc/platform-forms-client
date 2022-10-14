/**
 * @jest-environment node
 */

import { prismaMock } from "@jestUtils";
import { getUsers, getOrCreateUser, getApiUser } from "@lib/users";
import { Prisma } from "@prisma/client";
import { AccessControlError, createAbility } from "@lib/policyBuilder";
import { getUserPrivileges, ManageUsers } from "__utils__/permissions";

describe("User query tests should fail gracefully", () => {
  it("getOrCreateUser should fail gracefully - create", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    prismaMock.user.findUnique.mockResolvedValue(null);

    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );

    const result = await getOrCreateUser(ability, { email: "test@fail.ca" });
    expect(result).toEqual(null);
  });

  it("getOrCreateUser should fail gracefully - lookup", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    prismaMock.user.findUnique.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );

    const result = await getOrCreateUser(ability, { email: "test@fail.ca" });
    expect(result).toEqual(null);
  });

  it("getUsers should fail silenty", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    prismaMock.user.findMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );

    const result = await getUsers(ability);
    expect(result).toHaveLength(0);
  });

  it("getApiUser should fail gracefully", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    prismaMock.apiUser.findUnique.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );

    const result = await getApiUser(ability, "1");
    expect(result).toEqual(null);
  });
});

describe("getOrCreateUser", () => {
  it("Returns an existing User", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    const user = {
      id: "3",
      name: "user_1",
      admin: false,
      email: "fads@asdf.ca",
      emailVerified: null,
      image: null,
      privileges: ["Base privilege"],
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await getOrCreateUser(ability, { email: "fads@asdf.ca" });
    expect(result).toMatchObject(user);
  });

  it("Creates a new User", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    const user = {
      id: "3",
      name: "user_1",
      admin: false,
      email: "fads@asdf.ca",
      emailVerified: null,
      image: null,
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(user);

    const result = await getOrCreateUser(ability, {
      name: "test",
      email: "fads@asdf.ca",
      image: "/somewhere/pic",
    });

    expect(result).toMatchObject(user);
  });
});

describe("getUsers", () => {
  it("Returns a list of users", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    const returnedUsers = [
      {
        id: "3",
        name: "user_1",
        email: "fads@asdf.ca",
        emailVerified: null,
        image: null,
      },
      {
        id: "5",
        name: "user_2",
        email: "faaass@asdf.ca",
        emailVerified: null,
        image: null,
      },
    ];

    prismaMock.user.findMany.mockResolvedValue(returnedUsers);

    const result = await getUsers(ability);
    expect(result).toMatchObject(returnedUsers);
  });
});

describe("getApiUser", () => {
  it("Returns a ApiUsers", async () => {
    const ability = createAbility(getUserPrivileges(ManageUsers, {}));

    const returnedUser = {
      id: "3",
      name: "user_1",
      admin: false,
      templateId: "2",
      temporaryToken: "asdf",
      active: true,
      email: "fads@asdf.ca",
      created_at: new Date(),
      updated_at: new Date(),
    };

    prismaMock.apiUser.findUnique.mockResolvedValue(returnedUser);

    const result = await getApiUser(ability, "3");

    expect(result).toMatchObject(returnedUser);
  });
});

describe("Users CRUD functions should throw an error if user does not have sufficient permissions", () => {
  it("User with no permission should not be able to use CRUD functions", async () => {
    const ability = createAbility([]);

    expect(async () => {
      await getOrCreateUser(ability, { email: "test@fail.ca" });
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    expect(async () => {
      await getUsers(ability);
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    expect(async () => {
      await getApiUser(ability, "3");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });
});
