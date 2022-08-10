/**
 * @jest-environment node
 */

import { createMocks, RequestMethod } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import retrieve from "@pages/api/id/[form]/bearer";
import jwt from "jsonwebtoken";
import { logMessage } from "@lib/logger";
import * as adminLogs from "@lib/adminLogs";
import { prismaMock, checkLogs } from "@jestUtils";
import { Prisma } from "@prisma/client";
import { UserRole } from "@lib/types/user-types";

jest.mock("next-auth/next");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(getServerSession, true);
const mockLogMessage = jest.mocked(logMessage, true);

jest.mock("@lib/logger");

describe("/id/[form]/bearer", () => {
  describe("Access Controls", () => {
    test.each(["GET", "POST"])("Should deny without a session", async (verb) => {
      const { req, res } = createMocks({
        method: verb as RequestMethod,
        headers: {
          "Content-Type": "application/json",
        },
      });

      await retrieve(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Access Denied" })
      );
    });
  });
  describe("GET", () => {
    beforeEach(() => {
      const mockSession = {
        expires: "1",
        user: {
          email: "admin@cds.ca",
          name: "Admin user",
          image: "null",
          role: UserRole.Administrator,
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });
    it("Should return 400 if form ID was not supplied in the path", async () => {
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
      // Mocking executeQuery to return null as bearer token value
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        bearerToken: null,
      });

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
      // Mocking executeQuery to return a valid bearer token

      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        bearerToken: "testBearerToken",
      });
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

    it("Should return 404 status code if no form was found", async () => {
      // Mocking executeQuery to return an empty array
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

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
      // Mocking executeQuery to throw an error

      prismaMock.template.findUnique.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
      );
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
    beforeAll(() => {
      process.env.TOKEN_SECRET = "some_secret";
    });
    beforeEach(() => {
      const mockSession = {
        expires: "1",
        user: {
          email: "admin@cds.ca",
          name: "Admin user",
          image: "null",
          role: UserRole.Administrator,
          userId: "1",
        },
      };
      mockGetSession.mockResolvedValue(mockSession);
    });

    afterAll(() => {
      delete process.env.TOKEN_SECRET;
    });
    it("Should return a 200 status code, the refreshed token, and the id of the form", async () => {
      (prismaMock.template.update as jest.MockedFunction<any>).mockImplementationOnce(
        (args: Record<string, any>) =>
          Promise.resolve({
            id: 1,
            bearerToken: args.data.bearerToken,
          })
      );

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": "0",
        },
        query: {
          form: 1,
        },
      });

      await retrieve(req, res);
      expect(res.statusCode).toBe(200);
      const { id, bearerToken } = JSON.parse(res._getData());
      expect(id).toEqual(1);
      const decodedToken = jwt.verify(bearerToken, "some_secret");

      expect((decodedToken as { formID: string }).formID).toBe(1);

      expect(
        checkLogs(
          mockLogMessage.debug.mock.calls,
          "A bearer token was refreshed for form 1 by user Admin user"
        )
      ).toBeTruthy;
    });
    it("Should return a 404 status code if the form is not found", async () => {
      prismaMock.template.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Form does not exist", "P2025", "4.3.2")
      );

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": "0",
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
          mockLogMessage.debug.mock.calls,
          "A bearer token was attempted to be created for form 1 by user Admin user but the form does not exist"
        )
      ).toBeTruthy;
    });
    it("Should return a 400 status code if the form parameter is not provided", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": "0",
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

    it("Should return a 500 status code if any unexpected error occurs", async () => {
      prismaMock.template.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Timed out", "P2024", "4.3.2")
      );

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": "0",
        },
        query: {
          form: 1,
        },
      });

      await retrieve(req, res);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData()).error).toBe("Internal Service Error");
      expect(mockLogMessage.error.mock.calls.length).toBe(1);
      expect(mockLogMessage.error.mock.calls[0][0]).toEqual(new Error("Timed out"));
    });

    it("Should log admin activity if API call completed successfully", async () => {
      (prismaMock.template.update as jest.MockedFunction<any>).mockImplementationOnce(
        (args: Record<string, any>) =>
          Promise.resolve({
            id: 1,
            bearerToken: args.data.bearerToken,
          })
      );

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Length": "0",
        },
        query: {
          form: 1,
        },
      });

      const logAdminActivity = jest.spyOn(adminLogs, "logAdminActivity");

      await retrieve(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        "1",
        "Update",
        "RefreshBearerToken",
        "Bearer token for form id: 1 has been refreshed"
      );
    });
  });
});
