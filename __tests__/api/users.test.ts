/**
 * @jest-environment node
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import Redis from "ioredis-mock";
import { unstable_getServerSession } from "next-auth/next";
import users from "@pages/api/users";
import { prismaMock } from "@jestUtils";
import { Prisma } from "@prisma/client";
import { Session } from "next-auth";
import { mockUserPrivileges, ManageUsers, ViewUserPrivileges } from "__utils__/permissions";

jest.mock("next-auth/next");
jest.mock("@lib/adminLogs");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(unstable_getServerSession, { shallow: true });

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

describe("Users API endpoint", () => {
  describe("Access Control", () => {
    it("Shouldn't allow a request without a session", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      await users(req, res);

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Unauthorized" })
      );
      expect(prismaMock.user.findMany).toBeCalledTimes(0);
    });

    it("Shouldn't allow a request without a session", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          userId: "1",
        },
      });

      await users(req, res);

      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Unauthorized" })
      );
      expect(prismaMock.user.update).toBeCalledTimes(0);
    });
  });

  describe.each([[ViewUserPrivileges], [ManageUsers]])("GET", (privileges) => {
    beforeAll(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "forms@cds.ca",
          name: "forms",
          privileges: privileges,
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));
    });

    afterAll(() => {
      mockGetSession.mockReset();
    });

    it("Should return all users", async () => {
      // Mocking executeQuery to return a list of emails
      (prismaMock.user.findMany as jest.MockedFunction<any>).mockResolvedValue([
        {
          id: "1",
          email: "test@cds.ca",
          name: "Zoe",
        },
        {
          id: "2",
          email: "forms@cds.ca",
          name: "Joe",
        },
        {
          id: "3",
          email: "forms_2@cds.ca",
          name: "Boe",
        },
      ]);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });

      await users(req, res);

      expect(JSON.parse(res._getData())).toEqual([
        {
          id: "1",
          email: "test@cds.ca",
          name: "Zoe",
        },
        {
          id: "2",
          email: "forms@cds.ca",
          name: "Joe",
        },
        {
          id: "3",
          email: "forms_2@cds.ca",
          name: "Boe",
        },
      ]);

      expect(res.statusCode).toBe(200);
    });

    it("Should return empty array if there's db's error", async () => {
      prismaMock.user.findMany.mockRejectedValue(new Error("Error Thown"));

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });

      await users(req, res);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Could not process request" })
      );
    });
  });

  describe("PUT", () => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "forms@cds.ca",
          name: "forms",
          privileges: mockUserPrivileges(ManageUsers, {}),
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));
    });

    afterEach(() => {
      mockGetSession.mockReset();
    });

    it("Should return 400 invalid payload error when privileges is missing", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/11/owners",
        },
        body: {
          userId: "forms@cds.ca",
        },
      });

      await users(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Malformed Request" })
      );
    });

    it("Should return 400 invalid payload error when userId is missing", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/11/owners",
        },
        body: {
          privileges: [{ id: "2", action: "add" }],
        },
      });

      await users(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Malformed Request" })
      );
    });

    it("Should return 404 if userId is not found", async () => {
      // Mocking executeQuery it returns 0 updated rows
      prismaMock.user.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unknown Entry", "P2025", "4.3.2")
      );

      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          userID: "2",
          privileges: [],
        },
      });

      await users(req, res);

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "User not found" })
      );
    });

    it("Should successfully handle PUT request", async () => {
      (prismaMock.user.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "2",
        email: "forms@cds.ca",
        emailVerified: null,
        image: null,
        name: "Joe",
        privileges: [],
      });

      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          userID: "2",
          privileges: [],
        },
      });

      await users(req, res);

      expect(res.statusCode).toBe(200);
    });
  });

  describe("Users API functions should throw an error if user does not have permissions", () => {
    describe("Users API functions should throw an error if user does not have any permissions", () => {
      beforeAll(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms",
            privileges: [],
          },
        };
        mockGetSession.mockReturnValue(Promise.resolve(mockSession));
      });

      afterAll(() => {
        mockGetSession.mockReset();
      });

      it("User with no permission should not be able to use GET API functions", async () => {
        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
        });

        await users(req, res);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
      });

      it("User with no permission should not be able to use PUT API functions", async () => {
        const { req, res } = createMocks({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            userID: "2",
            privileges: [],
          },
        });

        await users(req, res);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
      });
    });

    describe("Users API functions should throw an error if user does not have sufficient permissions", () => {
      beforeAll(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms",
            privileges: ViewUserPrivileges,
          },
        };
        mockGetSession.mockReturnValue(Promise.resolve(mockSession));
      });

      afterAll(() => {
        mockGetSession.mockReset();
      });

      it("User with no permission should not be able to use PUT API functions", async () => {
        const { req, res } = createMocks({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            userID: "2",
            privileges: [],
          },
        });

        await users(req, res);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
      });
    });
  });
});
