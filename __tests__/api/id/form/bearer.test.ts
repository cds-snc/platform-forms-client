/**
 * @jest-environment node
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import { unstable_getServerSession } from "next-auth/next";
import retrieve from "@pages/api/id/[form]/bearer";
import { Base, ManageForms, getUserPrivileges } from "__utils__/permissions";
import jwt from "jsonwebtoken";
import { logActivity } from "@lib/auditLogs";
import { prismaMock } from "@jestUtils";
import { Prisma } from "@prisma/client";
import { Session } from "next-auth";

jest.mock("next-auth/next");
jest.mock("@lib/adminLogs");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(unstable_getServerSession, { shallow: true });

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
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Unauthorized" })
      );
    });
  });

  describe.each([
    [Base, "1", "1"],
    [ManageForms, "1", "2"],
  ])("GET", (privileges, privilegedUserId, mockedUserId) => {
    beforeEach(() => {
      const mockSession = {
        expires: "1",
        user: {
          id: "1",
          email: "admin@cds.ca",
          name: "Admin user",
          image: "null",
          privileges: getUserPrivileges(privileges, { user: { id: privilegedUserId } }),
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => mockGetSession.mockReset());

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
        users: [{ id: mockedUserId }],
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
        users: [{ id: mockedUserId }],
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

    it("Should return a 404 status code if there's an unexpected Prisma error", async () => {
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

      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData()).error).toEqual("Not Found");
    });
  });

  describe.each([
    [Base, "1", "1"],
    [ManageForms, "1", "2"],
  ])("POST", (privileges, privilegedUserId, mockedUserId) => {
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
          privileges: getUserPrivileges(privileges, { user: { id: privilegedUserId } }),
          id: "1",
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => mockGetSession.mockReset());

    afterAll(() => {
      delete process.env.TOKEN_SECRET;
    });

    it("Should return a 200 status code, the refreshed token, and the id of the form", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        bearerToken: "testBearerToken",
        users: [{ id: mockedUserId }],
      });

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
    });
    it("Should return a 404 status code if the form is not found", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

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
      expect(JSON.parse(res._getData()).error).toBe("Form Not Found");
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
    });

    it("Should log admin activity if API call completed successfully", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        users: [{ id: mockedUserId }],
      });

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
      expect(logActivity).lastCalledWith(
        "1",
        "Update",
        "RefreshBearerToken",
        "Bearer token for form id: 1 has been refreshed"
      );
    });
  });
});

describe("Bearer API functions should throw an error if user does not have permissions", () => {
  describe("Bearer API functions should throw an error if user does not have any permissions", () => {
    beforeAll(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: [],
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));
    });

    afterAll(() => {
      mockGetSession.mockReset();
    });

    it.each(["GET", "POST"])(
      "User with no permission should not be able to use %s API functions",
      async (httpMethod) => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [{ id: "1" }],
        });

        const { req, res } = createMocks({
          method: httpMethod as RequestMethod,
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          query: {
            form: 1,
          },
        });

        await retrieve(req, res);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
      }
    );
  });

  describe("Bearer API functions should throw an error if user does not have sufficient permissions", () => {
    afterAll(() => {
      mockGetSession.mockReset();
    });

    it.each(["GET", "POST"])(
      "User with no relation to the template being interacted with should not be able to use the %s API function",
      async (httpMethod) => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms",
            privileges: getUserPrivileges(Base, { user: { id: "1" } }),
          },
        };
        mockGetSession.mockReturnValue(Promise.resolve(mockSession));

        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [{ id: "2" }],
        });

        const { req, res } = createMocks({
          method: httpMethod as RequestMethod,
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          query: {
            form: 1,
          },
        });

        await retrieve(req, res);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
      }
    );
  });
});
