/**
 * @jest-environment node
 */
import { createMocks } from "node-mocks-http";

import { getSession } from "next-auth/react";
import users from "@pages/api/users";
import { prismaMock } from "@jestUtils";
import { Prisma } from "@prisma/client";
import * as logAdmin from "@lib/adminLogs";

jest.mock("next-auth/react");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(getSession, true);

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
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
      expect(prismaMock.user.findMany).toBeCalledTimes(0);
    });
    it("Shouldn't allow a request without an admin session", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user", admin: false },
      };

      mockGetSession.mockReturnValue(Promise.resolve(mockSession));

      await users(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
      expect(prismaMock.user.findMany).toBeCalledTimes(0);
    });

    it("Shouldn't allow a request without an admin session", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          userID: "2",
          isAdmin: "false",
        },
      });
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user", admin: false },
      };

      mockGetSession.mockReturnValue(Promise.resolve(mockSession));

      await users(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
      expect(prismaMock.user.update).toBeCalledTimes(0);
    });
    it("Shouldn't allow a request without a session", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          userID: "1",
          isAdmin: "false",
        },
      });

      await users(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
      expect(prismaMock.user.update).toBeCalledTimes(0);
    });
  });
  describe("GET", () => {
    beforeAll(() => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms", admin: true, id: "1" },
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
          admin: true,
          name: "Zoe",
        },
        {
          id: "2",
          email: "forms@cds.ca",
          admin: false,
          name: "Joe",
        },
        {
          id: "3",
          email: "forms_2@cds.ca",
          admin: false,
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
      expect(JSON.parse(res._getData())).toEqual({
        users: [
          {
            id: "1",
            email: "test@cds.ca",
            admin: true,
            name: "Zoe",
          },
          {
            id: "2",
            email: "forms@cds.ca",
            admin: false,
            name: "Joe",
          },
          {
            id: "3",
            email: "forms_2@cds.ca",
            admin: false,
            name: "Boe",
          },
        ],
      });

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
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms", admin: true, id: "1" },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));
    });
    afterEach(() => {
      mockGetSession.mockReset();
    });
    it("Should return 400 invalid payload error when isAdmin is missing", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/11/owners",
        },
        body: {
          userID: "forms@cds.ca",
        },
      });
      await users(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Malformed Request" })
      );
    });
    it("Should return 400 invalid payload error when userID is missing", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/11/owners",
        },
        body: {
          isAdmin: true,
        },
      });
      await users(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Malformed Request" })
      );
    });
    it("Should return 404 if userID is not found", async () => {
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
          isAdmin: "true",
        },
      });
      await users(req, res);
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "User not found" })
      );
    });

    it("Should successfully handle PUT request", async () => {
      prismaMock.user.update.mockResolvedValue({
        id: "2",
        email: "forms@cds.ca",
        admin: true,
        emailVerified: null,
        image: null,
        name: "Joe",
      });
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          userID: "2",
          isAdmin: "true",
        },
      });

      const logAdminActivity = jest.spyOn(logAdmin, "logAdminActivity");

      await users(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        "1",
        "Update",
        "GrantAdminRole",
        "Admin role has been granted for user id: 2"
      );
    });
  });
});
