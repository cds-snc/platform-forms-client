import type { MockedFunction } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { prismaMock } from "@testUtils";
import { getUsers, getUsersPage, getOrCreateUser } from "@lib/users";
import { Prisma } from "@gcforms/database";

import { AccessControlError } from "@lib/auth/errors";
import { ManageUsers, Base } from "__utils__/permissions";

import { logEvent } from "@lib/auditLogs";
vi.mock("@lib/privileges");

import { JWT } from "next-auth/jwt";
import { mockAuthorizationFail, mockAuthorizationPass } from "__utils__/authorization";

const userId = "1";

vi.mock("@lib/auditLogs", async () => {
  const __actual0 = await vi.importActual<any>("@lib/auditLogs");
  return {
  __esModule: true,
  logEvent: vi.fn(),
  AuditLogDetails: __actual0.AuditLogDetails,
  AuditLogAccessDeniedDetails: __actual0.AuditLogAccessDeniedDetails,};
});

const mockedLogEvent = vi.mocked(logEvent);

describe("User query tests should fail gracefully", () => {
  beforeEach(() => {
    mockAuthorizationPass(userId);
  });
  it("getOrCreateUser should fail gracefully - create", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    (prismaMock.privilege.findUnique as MockedFunction<any>).mockResolvedValue({ id: "2" });
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
    (prismaMock.privilege.findUnique as MockedFunction<any>).mockResolvedValue({ id: "2" });
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

    (prismaMock.user.findUnique as MockedFunction<any>).mockResolvedValue(user);

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
    (prismaMock.privilege.findUnique as MockedFunction<any>).mockResolvedValue({
      id: "2",
    });
    (prismaMock.user.create as MockedFunction<any>).mockResolvedValue(user);

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

    (prismaMock.user.findMany as MockedFunction<any>).mockResolvedValue(returnedUsers);

    const result = await getUsers();
    expect(result).toMatchObject(returnedUsers);
  });

  it("Returns a paginated list of users filtered by email", async () => {
    const returnedUsers = [
      {
        id: "5",
        name: "user_2",
        email: "user-2@test.ca",
        active: true,
        privileges: Base,
      },
    ];

    prismaMock.user.count.mockResolvedValue(1);
    (prismaMock.user.findMany as MockedFunction<any>).mockResolvedValue(returnedUsers);

    const result = await getUsersPage({
      page: 2,
      pageSize: 10,
      property: "email",
      query: "user-2",
      userState: "active",
    });

    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: {
        active: true,
        OR: [{ email: { contains: "user-2", mode: "insensitive" } }],
      },
    });

    expect(prismaMock.user.findMany).toHaveBeenCalledWith({
      where: {
        active: true,
        OR: [{ email: { contains: "user-2", mode: "insensitive" } }],
      },
      select: expect.any(Object),
      skip: 10,
      take: 10,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    expect(result).toEqual({
      users: returnedUsers,
      totalCount: 1,
      page: 2,
      pageSize: 10,
      totalPages: 1,
    });
  });

  it("Returns a paginated list of users filtered by id", async () => {
    const returnedUsers = [
      {
        id: "cmp1aao3z000hmonbhu53dvcf",
        name: "user_3",
        email: "user-3@test.ca",
        active: true,
        privileges: Base,
      },
    ];

    prismaMock.user.count.mockResolvedValue(1);
    (prismaMock.user.findMany as MockedFunction<any>).mockResolvedValue(returnedUsers);

    const result = await getUsersPage({
      property: "id",
      query: "cmp1aao3z000hmonbhu53dvcf",
    });

    expect(prismaMock.user.count).toHaveBeenCalledWith({
      where: {
        OR: [{ id: "cmp1aao3z000hmonbhu53dvcf" }],
      },
    });

    expect(result.users).toEqual(returnedUsers);
  });

  it("Returns an empty page cleanly when user search fails", async () => {
    prismaMock.user.count.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", {
        code: "P2024",
        clientVersion: "4.12.0",
      })
    );
    prismaMock.user.findMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Timed out", {
        code: "P2024",
        clientVersion: "4.12.0",
      })
    );

    const result = await getUsersPage({ query: "test" });

    expect(result).toEqual({
      users: [],
      totalCount: 0,
      page: 1,
      pageSize: 24,
      totalPages: 0,
    });
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
