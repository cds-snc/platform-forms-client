import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import users from "@pages/api/users";
import executeQuery from "@lib/integration/queryManager";
import { logAdminActivity } from "@lib/adminLogs";

jest.mock("next-auth/client");
jest.mock("@lib/integration/queryManager");

jest.mock("@lib/integration/dbConnector", () => {
  const mClient = {
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
  };
  return jest.fn(() => mClient);
});

jest.mock("@lib/adminLogs", () => ({
  logAdminActivity: jest.fn(),
}));

describe("Users API endpoint", () => {
  describe("GET: Retrieve list of users", () => {
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
      expect(executeQuery).toBeCalledTimes(0);
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

      client.getSession.mockReturnValue(mockSession);

      await users(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
      expect(executeQuery).toBeCalledTimes(0);
    });

    it("Should return all users", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to return a list of emails
      executeQuery.mockReturnValue({
        rows: [
          { id: "1", email: "test@cds.ca", admin: true },
          { id: "2", email: "forms@cds.ca", admin: false },
          { id: "3", email: "forms_2@cds.ca", admin: false },
        ],
        rowCount: 3,
      });
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      await users(req, res);
      expect(JSON.parse(res._getData())).toMatchObject({
        users: [
          { id: "1", email: "test@cds.ca", admin: true },
          { id: "2", email: "forms@cds.ca", admin: false },
          { id: "3", email: "forms_2@cds.ca", admin: false },
        ],
      });

      expect(res.statusCode).toBe(200);
    });

    it("Should return empty array if there's db's error", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to throw an error
      executeQuery.mockImplementation(() => {
        throw new Error("Error");
      });

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

  describe("PUT: Change admin status on user", () => {
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

      client.getSession.mockReturnValue(mockSession);

      await users(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
      expect(executeQuery).toBeCalledTimes(0);
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
      expect(executeQuery).toBeCalledTimes(0);
    });

    it("Should return 400 invalid payload error when isAdmin is missing", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
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
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
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
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms", admin: true },
      };
      // Mocking executeQuery it returns 0 updated rows
      executeQuery.mockReturnValue({ rows: [], rowCount: 0 });

      client.getSession.mockReturnValue(mockSession);
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
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms", admin: true, id: 1 },
      };
      client.getSession.mockReturnValue(mockSession);

      executeQuery.mockReturnValue({
        rows: [{ id: "2", email: "test@cds.ca", admin: false }],
        rowCount: 1,
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

      await users(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        1,
        "Update",
        "GrantAdminRole",
        "Admin role has been granted for user id: 2"
      );
    });
  });
});
