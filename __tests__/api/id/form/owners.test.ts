/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * @jest-environment node
 */

import { createMocks, RequestMethod } from "node-mocks-http";
import { getSession } from "next-auth/react";
import owners from "@pages/api/id/[form]/owners";
import { logAdminActivity } from "@lib/adminLogs";
import { prismaMock } from "@jestUtils";
import { Prisma } from "@prisma/client";

jest.mock("next-auth/react");

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(getSession, true);

jest.mock("@lib/adminLogs", () => ({
  logAdminActivity: jest.fn(),
}));

describe("/id/[forms]/owners", () => {
  describe("Access Control", () => {
    test.each(["GET", "POST", "PUT"])(
      "Shouldn't allow a request without a valid session",
      async (httpVerb) => {
        const { req, res } = createMocks({
          method: httpVerb as RequestMethod,
          headers: {
            "Content-Type": "application/json",
          },
          query: {
            form: "1",
          },
        });

        await owners(req, res);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toMatchObject({ error: "Access Denied" });
      }
    );
    test.each(["DELETE", "PATCH"])("Shouldn't allow an unaccepted method", async (httpVerb) => {
      const { req, res } = createMocks({
        method: httpVerb as RequestMethod,
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "1",
        },
      });

      await owners(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toMatchObject({ error: "HTTP Method Forbidden" });
    });
  });
  describe("GET: Retrieve list of emails API endpoint", () => {
    beforeEach(() => {
      const mockSession = {
        expires: "1",
        user: { email: "forms@cds.ca", name: "forms user", admin: true, id: "1" },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });
    it("Should return an error 'Malformed API Request'", async () => {
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        query: {
          form: "",
        },
      });

      await owners(req, res);
      expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request FormID not define");
      expect(res.statusCode).toBe(400);
    });

    it("Should return all the emails associated with the form ID.", async () => {
      // Mocking query to return a list of emails

      (prismaMock.formUser.findMany as jest.MockedFunction<any>).mockResolvedValue([
        { id: 1, email: "test@cds.ca", active: true },
        { id: 2, email: "forms@cds.ca", active: false },
      ]);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/89/owners",
        },
        query: {
          form: "89",
        },
      });
      await owners(req, res);
      expect(JSON.parse(res._getData())).toEqual([
        { id: 1, email: "test@cds.ca", active: true },
        { id: 2, email: "forms@cds.ca", active: false },
      ]);

      expect(res.statusCode).toBe(200);
    });

    it("Should return a list that contains only one email", async () => {
      // Mocking executeQuery to return a list with only an email
      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/1/owners",
        },
        query: {
          form: "1",
        },
      });
      (prismaMock.formUser.findMany as jest.MockedFunction<any>).mockResolvedValue([
        {
          id: 1,
          email: "oneEmail@cds.ca",
          active: true,
        },
      ]);
      await owners(req, res);
      expect(JSON.parse(res._getData())).toMatchObject([
        { id: 1, email: "oneEmail@cds.ca", active: true },
      ]);
      expect(res.statusCode).toBe(200);
    });

    it("Should return an empty array if form has no emails associated", async () => {
      // Mocking executeQuery to return an empty list
      prismaMock.formUser.findMany.mockResolvedValue([]);

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        query: {
          form: "99",
        },
      });

      await owners(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual([]);
    });

    it("Should return 404 as statusCode if there's db's error", async () => {
      // Mocking prisma to throw an error
      prismaMock.user.findMany.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Can't reach database server", "P1001", "4.3.2")
      );

      const { req, res } = createMocks({
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/33/owners",
        },
        query: {
          form: "33",
        },
      });

      await owners(req, res);
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData()).error).toEqual("Form Not Found");
    });
  });

  describe("PUT: Activate and deactivate a form's owners API endpoint", () => {
    it("Should return 400 invalid payload error(active) field/value is missing", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000/api/id/11/owners",
        },
        body: {
          email: "forms@cds.ca",
          active: "",
        },
        query: {
          form: "11",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Invalid payload fields are not define" })
      );
    });

    it("Should return 400 invalid payload error(email) field/value is missing", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "",
          active: true,
        },
        query: {
          form: "20",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Invalid payload fields are not define" })
      );
    });

    it("Should return 404 Form or email Not Found in form_users", async () => {
      // Mocking prisma to throw an error
      prismaMock.formUser.update.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unknown User", "P2025", "4.3.2")
      );

      const { req, res } = createMocks({
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "forms@cds.ca",
          active: true,
        },
        query: {
          form: "10",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(404);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Form or email Not Found" })
      );
    });
    test.each([0, 1])(
      "Should return 200 status code: owners are deactivated/activated",
      async (elem) => {
        //Mocking prisma
        (prismaMock.formUser.update as jest.MockedFunction<any>).mockResolvedValue({
          id: elem,
          active: true,
        });

        const { req, res } = createMocks({
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds.ca",
            active: true,
          },
          query: {
            form: "12",
          },
        });
        await owners(req, res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res._getData())).toMatchObject({ id: elem, active: true });
        expect(logAdminActivity).toHaveBeenCalledWith(
          "1",
          "Update",
          "GrantFormAccess",
          "Access to form id: 12 has been granted for email: forms@cds.ca"
        );
      }
    );
  });

  describe("POST: Associate an email to a template data API endpoint", () => {
    it("Should return 400 FormID doesn't exist or User already assigned in db", async () => {
      //Mocking db result by throwing constraint violation error.
      prismaMock.formUser.create.mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Unknown User", "P2003", "4.3.2")
      );
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "test@gc.ca",
        },
        query: {
          form: "888",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          error: "The formID does not exist or User is already assigned",
        })
      );
    });

    it("Should create a new record and return 200 code along with the id", async () => {
      // return the id of the newly created record.

      (prismaMock.formUser.create as jest.MockedFunction<any>).mockResolvedValue({
        id: 1,
      });
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "test9@gc.ca",
        },
        query: {
          form: "9",
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({
          success: {
            id: 1,
          },
        })
      );
    });

    it("Should return 400 undefined formID was supplied", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "forms@cds-snc.ca",
        },
        query: {
          form: undefined,
        },
      });
      await owners(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Malformed API Request Invalid formID" })
      );
    });

    test.each([
      "",
      "wrongEmail.gc.ca",
      undefined,
      "testNotValidGovDomainName@google.com",
      "@gc.ca",
    ])(
      "Should return 400 status code wiht invalid email in payload for all those cases",
      async (elem) => {
        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: elem,
          },
          query: {
            form: "23",
          },
        });
        await owners(req, res);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "The email is not a valid GC email" })
        );
      }
    );

    it("Should log admin activity if POST API call completed successfully", async () => {
      // return the id of the newly created record.
      (prismaMock.formUser.create as jest.MockedFunction<any>).mockResolvedValue({
        id: 1,
      });

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          email: "test9@gc.ca",
        },
        query: {
          form: "9",
        },
      });

      await owners(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        "1",
        "Create",
        "GrantInitialFormAccess",
        "Email: test9@gc.ca has been given access to form id: 9"
      );
    });
  });
});
