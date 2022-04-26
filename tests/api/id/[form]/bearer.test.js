import { createMocks } from "node-mocks-http";
import client from "next-auth/client";
import retrieve from "@pages/api/id/[form]/bearer";
import executeQuery from "@lib/integration/queryManager";
import jwt from "jsonwebtoken";
import { logMessage } from "@lib/logger";
import { checkLogs } from "@lib/jestUtils";
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

describe("/id/[form]/bearer", () => {
  describe("GET", () => {
    it("Should return 400 if form ID was not supplied in the path", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };

      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/8/bearer",
        },
        query: {
          form: "", //An empty form ID
        },
      });

      await retrieve(req, res);
      expect(JSON.parse(res._getData()).error).toEqual(
        "form ID parameter was not provided in the resource path"
      );
      expect(res.statusCode).toBe(400);
    });

    it("Should return a 200 status code and Null as token's value should the form exist but no token is present", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to return null as bearer token value
      executeQuery.mockReturnValue({ rows: [{ bearerToken: null }], rowCount: 1 });

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "11",
        },
      });

      await retrieve(req, res);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ bearerToken: null }));
      expect(res.statusCode).toBe(200);
    });

    it("Should return a 200 status code and a valid token if it exists for a form.", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to return a valid bearer token
      executeQuery.mockReturnValue({ rows: [{ bearerToken: "testBearerToken" }], rowCount: 1 });

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "12",
        },
      });

      await retrieve(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ bearerToken: "testBearerToken" })
      );
    });

    it("Should return a 403 status code if there is no valid session", async () => {
      client.getSession.mockReturnValue(undefined);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "45",
        },
      });

      await retrieve(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
    });

    it("Should return 404 status code if no form was found", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to return an empty array
      executeQuery.mockReturnValue({ rows: [], rowCount: 0 });

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "23",
        },
      });
      await retrieve(req, res);

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData()).error).toEqual("Not Found");
    });

    it("Should return 500 status code if there's an unexpected error", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);
      // Mocking executeQuery to throw an error
      executeQuery.mockImplementation(() => {
        throw new Error("UnExcepted Error");
      });

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "101",
        },
      });

      await retrieve(req, res);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData()).error).toEqual("Internal Service Error");
    });
  });
  describe("POST", () => {
    let logMessageDebugSpy;
    let logMessageErrorSpy;
    beforeAll(() => {
      process.env.TOKEN_SECRET = "some_secret";
    });
    beforeEach(() => {
      logMessageDebugSpy = jest.spyOn(logMessage, "debug");
      logMessageErrorSpy = jest.spyOn(logMessage, "error");
    });
    afterEach(() => {
      logMessageDebugSpy.mockRestore();
      logMessageErrorSpy.mockRestore();
    });
    afterAll(() => {
      delete process.env.TOKEN_SECRET;
    });
    it("Should return a 200 status code, the refreshed token, and the id of the form", async () => {
      executeQuery.mockImplementationOnce((client, sql, values) => {
        return {
          rowCount: 1,
          rows: [
            {
              id: values[1],
              token: values[0],
            },
          ],
        };
      });

      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": 0,
        },
        query: {
          form: 1,
        },
      });

      await retrieve(req, res);
      expect(res.statusCode).toBe(200);
      const token = executeQuery.mock.calls[0][2][0];
      expect(JSON.parse(res._getData())).toEqual({
        id: 1,
        token,
      });

      const decodedToken = jwt.verify(token, "some_secret");
      expect(decodedToken.formID).toBe(1);

      expect(
        checkLogs(
          logMessageDebugSpy.mock.calls,
          "A bearer token was refreshed for form 1 by user Admin user"
        )
      ).toBeTruthy;
    });
    it("Should return a 404 status code if the form is not found", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);

      executeQuery.mockReturnValue({
        rowCount: 0,
      });

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": 0,
        },
        query: {
          form: 1,
        },
      });

      await retrieve(req, res);

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData()).error).toBe("Not Found");
      expect(
        checkLogs(
          logMessageDebugSpy.mock.calls,
          "A bearer token was attempted to be created for form 1 by user Admin user but the form does not exist"
        )
      ).toBeTruthy;
    });
    it("Should return a 400 status code if the form parameter is not provided", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": 0,
        },
        query: {
          form: undefined,
        },
      });

      await retrieve(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData()).error).toBe(
        "form ID parameter was not provided in the resource path"
      );
    });
    it("Should return a 403 status code if the session is not present", async () => {
      client.getSession.mockReturnValue(undefined);
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": 0,
        },
        query: {
          form: undefined,
        },
      });

      await retrieve(req, res);
      expect(res.statusCode).toBe(403);
    });
    it("Should return a 500 status code if any unexpected error occurs", async () => {
      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true },
      };
      client.getSession.mockReturnValue(mockSession);

      executeQuery.mockImplementationOnce(() => {
        throw new Error("some error");
      });

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": 0,
        },
        query: {
          form: 1,
        },
      });

      await retrieve(req, res);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData()).error).toBe("Internal Service Error");
      expect(logMessageErrorSpy.mock.calls.length).toBe(1);
      expect(logMessageErrorSpy.mock.calls[0][0]).toEqual(new Error("some error"));
    });

    it("Should log admin activity if API call completed successfully", async () => {
      executeQuery.mockImplementationOnce((client, sql, values) => {
        return {
          rowCount: 1,
          rows: [
            {
              id: values[1],
              token: values[0],
            },
          ],
        };
      });

      const mockSession = {
        expires: "1",
        user: { email: "admin@cds.ca", name: "Admin user", image: "null", admin: true, id: 1 },
      };
      client.getSession.mockReturnValue(mockSession);

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": 0,
        },
        query: {
          form: 1,
        },
      });

      await retrieve(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        1,
        "Update",
        "RefreshBearerToken",
        "Bearer token for form id: 1 has been refreshed"
      );
    });
  });
});
