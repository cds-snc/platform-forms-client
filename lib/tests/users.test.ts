/* eslint-disable @typescript-eslint/no-explicit-any */

import { prismaMock } from "@jestUtils";
import { getUsers, getOrCreateUser } from "@lib/users";
import { Prisma } from "@prisma/client";

import { AccessControlError } from "@lib/auth/errors";
import { ManageUsers, Base } from "__utils__/permissions";

import { logEvent } from "@lib/auditLogs";
jest.mock("@lib/auditLogs");
jest.mock("@lib/privileges");

import { JWT } from "next-auth/jwt";
import { mockAuthorizationFail, mockAuthorizationPass } from "__utils__/authorization";

const userId = "1";

jest.mock("@lib/auditLogs");
const mockedLogEvent = jest.mocked(logEvent, { shallow: true });

describe("User query tests should fail gracefully", () => {
  beforeEach(() => {
    mockAuthorizationPass(userId);
  });
  it("getOrCreateUser should fail gracefully - create", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    (prismaMock.privilege.findUnique as jest.MockedFunction<any>).mockResolvedValue({ id: "2" });
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", {
        code: "P2024",
        clientVersion: "4.12.0",
      })
    );

    const result = await getOrCreateUser({ email: "test-user@test.ca" } as JWT);
    expect(result).toEqual(null);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it("getOrCreateUser should fail gracefully - lookup", async () => {
    prismaMock.user.findUnique.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", {
        code: "P2024",
        clientVersion: "4.12.0",
      })
    );
    (prismaMock.privilege.findUnique as jest.MockedFunction<any>).mockResolvedValue({ id: "2" });
    prismaMock.user.create.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", {
        code: "P2024",
        clientVersion: "4.3.2",
      })
    );
    const result = await getOrCreateUser({ email: "test-user@test.ca" } as JWT);
    expect(result).toEqual(null);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it("getUsers should fail silenty", async () => {
    prismaMock.user.findMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", {
        code: "P2024",
        clientVersion: "4.12.0",
      })
    );

    const result = await getUsers();
    expect(result).toHaveLength(0);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });
});

describe("getOrCreateUser", () => {
  it("Returns an existing User", async () => {
    const user = {
      id: "3",
      name: "user_1",
      email: "fads@asdf.ca",
      privileges: ManageUsers,
    };

    (prismaMock.user.findUnique as jest.MockedFunction<any>).mockResolvedValue(user);

    const result = await getOrCreateUser({ email: "fads@asdf.ca" } as JWT);
    expect(result).toMatchObject(user);
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  it("Creates a new User", async () => {
    const user = {
      id: "3",
      name: "test",
      email: "fads@asdf.ca",
      privileges: Base,
    };

    prismaMock.user.findUnique.mockResolvedValue(null);
    (prismaMock.privilege.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "2",
    });
    (prismaMock.user.create as jest.MockedFunction<any>).mockResolvedValue(user);

    const result = await getOrCreateUser({
      name: "test",
      email: "fads@asdf.ca",
    } as JWT);

    expect(result).toMatchObject(user);
    expect(prismaMock.user.create).toHaveBeenCalledWith({
      data: {
        email: "fads@asdf.ca",
        image: undefined,
        name: "test",
        privileges: {
          connect: {
            id: "2",
          },
        },
      },
      select: {
        email: true,
        id: true,
        name: true,
        privileges: true,
        active: true,
      },
    });
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user.id,
      { id: user.id, type: "User" },
      "UserRegistration"
    );
  });
});

describe("getUsers", () => {
  it("Returns a list of users", async () => {
    const returnedUsers = [
      {
        id: "3",
        name: "user_1",
        email: "fads@asdf.ca",
        privileges: Base,
      },
      {
        id: "5",
        name: "user_2",
        email: "faaass@asdf.ca",
        privileges: Base,
      },
    ];

    (prismaMock.user.findMany as jest.MockedFunction<any>).mockResolvedValue(returnedUsers);

    const result = await getUsers();
    expect(result).toMatchObject(returnedUsers);
  });
});

describe("Users CRUD functions should throw an error if user does not have any permissions", () => {
  beforeEach(() => {
    mockAuthorizationFail(userId);
  });
  it("User with no permission should not be able to use CRUD functions", async () => {
    await expect(getUsers()).rejects.toThrow(AccessControlError);
    expect(mockedLogEvent).toHaveBeenCalledWith(
      userId,
      { type: "User" },
      "AccessDenied",
      "Attempted to list users"
    );
  });
});
