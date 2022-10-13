/**
 * @jest-environment node
 */

import { getUsers, adminRole, getOrCreateUser, getFormUser } from "@lib/users";
import { prismaMock } from "@jestUtils";
import { Prisma, UserRole } from "@prisma/client";

describe("User query tests should fail gracefully", () => {
  it("getUsers should fail silenty", async () => {
    prismaMock.user.findMany.mockRejectedValue(new Error("Test Error"));
    const result = await getUsers();
    expect(result).toHaveLength(0);
  });
  it("adminRole should fail gracefully", async () => {
    prismaMock.user.update.mockRejectedValue(new Error("Test Error"));
    const result = await adminRole(false, "4");
    expect(result).toEqual([false, false]);
  });
  it("getOrCreateUser should fail gracefully - lookup", async () => {
    prismaMock.user.findUnique.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );
    const result = await getOrCreateUser({ email: "test@fail.ca" });
    expect(result).toEqual(null);
  });
  it("getOrCreateUser should fail gracefully - create", async () => {
    prismaMock.user.findUnique.mockRejectedValue(null);

    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );
    const result = await getOrCreateUser({ email: "test@fail.ca" });
    expect(result).toEqual(null);
  });
  it("getFormUser should fail gracefully", async () => {
    prismaMock.formUser.findUnique.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
    );
    const result = await getFormUser("1");
    expect(result).toEqual(null);
  });
});

describe("getUsers", () => {
  it("Returns a list of users", async () => {
    const returnedUsers = [
      {
        id: "3",
        name: "user_1",
        admin: false,
        email: "fads@asdf.ca",
        emailVerified: null,
        image: null,
      },
      {
        id: "5",
        name: "user_2",
        admin: true,
        email: "faaass@asdf.ca",
        emailVerified: null,
        image: null,
      },
    ];
    prismaMock.user.findMany.mockResolvedValue(returnedUsers);

    const result = await getUsers();
    expect(result).toMatchObject(returnedUsers);
  });
});
describe("adminRole", () => {
  it("Modifies an adminitrator", async () => {
    prismaMock.user.update.mockResolvedValue({
      id: "2",
      name: "user_1",
      admin: false,
      email: "faaass@asdf.ca",
      emailVerified: null,
      image: null,
    });

    const result = await adminRole(false, "2");
    expect(
      prismaMock.user.update.calledWith({
        where: {
          id: "2",
        },
        data: {
          admin: false,
        },
      })
    );

    expect(result).toMatchObject([true, true]);
  });
});
describe("getOrCreateUser", () => {
  it("Returns an existing User", async () => {
    const user = {
      id: "3",
      name: "user_1",
      admin: false,
      email: "fads@asdf.ca",
      emailVerified: null,
      image: null,
      role: UserRole.PROGRAM_ADMINISTRATOR,
    };

    prismaMock.user.findUnique.mockResolvedValue(user);

    const result = await getOrCreateUser({ sub: "3", email: "fads@asdf.ca" });
    expect(result).toMatchObject(user);
  });
  it("Creates a new User", async () => {
    const user = {
      id: "3",
      name: "user_1",
      admin: false,
      email: "fads@asdf.ca",
      emailVerified: null,
      image: null,
      role: UserRole.PROGRAM_ADMINISTRATOR,
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    prismaMock.user.create.mockResolvedValue(user);

    const result = await getOrCreateUser({
      sub: "3",
      name: "test",
      email: "fads@asdf.ca",
    });

    expect(result).toMatchObject(user);
  });
});
describe("getFormUser", () => {
  it("Returns a FormUsers", async () => {
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

    prismaMock.formUser.findUnique.mockResolvedValue(returnedUser);

    const result = await getFormUser("3");
    expect(result).toMatchObject(returnedUser);
  });
});
