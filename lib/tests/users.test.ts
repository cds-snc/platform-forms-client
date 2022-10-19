/**
 * @jest-environment node
 */

import { prismaMock } from "@jestUtils";
import { getUsers, getOrCreateUser } from "@lib/users";
import { Prisma } from "@prisma/client";
import { AccessControlError, createAbility } from "@lib/policyBuilder";
import { getUserPrivileges, ManageUsers, ViewUserPrivileges } from "__utils__/permissions";

describe("User query tests should fail gracefully", () => {
  it("getOrCreateUser should fail gracefully - create", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );

    const result = await getOrCreateUser({ email: "test@fail.ca" });
    expect(result).toEqual(null);
  });

  it("getOrCreateUser should fail gracefully - lookup", async () => {
    prismaMock.user.findUnique.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );

    const result = await getOrCreateUser({ email: "test@fail.ca" });
    expect(result).toEqual(null);
  });

  it("getUsers should fail silenty", async () => {
    const ability = createAbility(ManageUsers);

    prismaMock.user.findMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );

    const result = await getUsers(ability);
    expect(result).toHaveLength(0);
  });
});

describe("getOrCreateUser", () => {
  it("Returns an existing User", async () => {
    const user = {
      id: "3",
      name: "user_1",
      email: "fads@asdf.ca",
      emailVerified: null,
      image: null,
      privileges: ManageUsers,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await getOrCreateUser({ email: "fads@asdf.ca" });
    expect(result).toMatchObject(user);
  });

  it("Creates a new User", async () => {
    const user = {
      id: "3",
      name: "user_1",
      email: "fads@asdf.ca",
      emailVerified: null,
      image: null,
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(user);

    const result = await getOrCreateUser({
      name: "test",
      email: "fads@asdf.ca",
      image: "/somewhere/pic",
    });

    expect(result).toMatchObject(user);
  });
});

describe("getUsers", () => {
  it.each([[ViewUserPrivileges], [ManageUsers]])("Returns a list of users", async (privileges) => {
    const ability = createAbility(privileges);

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

describe("Users CRUD functions should throw an error if user does not have any permissions", () => {
  it("User with no permission should not be able to use CRUD functions", async () => {
    const ability = createAbility([]);

    await expect(async () => {
      await getUsers(ability);
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });
});
