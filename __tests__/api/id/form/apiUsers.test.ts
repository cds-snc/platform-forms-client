/**
 * @jest-environment node
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */

import { createMocks, RequestMethod } from "node-mocks-http";
import { getServerSession } from "next-auth/next";
import apiUsers from "pages/api/id/[form]/apiusers";
import { prismaMock } from "@jestUtils";
import { Prisma } from "@prisma/client";
import { Session } from "next-auth";
import { Base, ManageForms, mockUserPrivileges } from "__utils__/permissions";

jest.mock("next-auth/next");

//Needed in the typescript version of the test so types are inferred correctly
const mockGetSession = jest.mocked(getServerSession, { shallow: true });

describe.skip("/id/[forms]/owners", () => {
  describe("Requires a valid session to access API", () => {
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

        await apiUsers(req, res);
        expect(res.statusCode).toBe(401);
        expect(JSON.parse(res._getData())).toMatchObject({ error: "Unauthorized" });
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

      await apiUsers(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toMatchObject({ error: "HTTP Method Forbidden" });
    });
  });
  describe("GET: Retrieve list of emails API endpoint", () => {
    describe("Base Permissions", () => {
      beforeEach(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms user",
            privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
            acceptableUse: true,
          },
        };

        mockGetSession.mockResolvedValue(mockSession);
      });
      afterEach(() => mockGetSession.mockReset());
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

        await apiUsers(req, res);
        expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request FormID not define");
        expect(res.statusCode).toBe(400);
      });

      it("Should return all the emails associated with the form ID.", async () => {
        // Mocking query to return a list of emails

        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [
            { id: 1, email: "test@cds.ca", active: true },
            { id: 2, email: "forms@cds.ca", active: false },
          ],

          users: [
            {
              id: "1",
            },
          ],
        });

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
        await apiUsers(req, res);
        expect(JSON.parse(res._getData())).toEqual([
          { id: 1, email: "test@cds.ca", active: true },
          { id: 2, email: "forms@cds.ca", active: false },
        ]);

        expect(res.statusCode).toBe(200);
      });
      it("Should not allow a user to view a non-owned form", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [
            { id: 1, email: "test@cds.ca", active: true },
            { id: 2, email: "forms@cds.ca", active: false },
          ],

          users: [
            {
              id: "2",
            },
          ],
        });

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
        await apiUsers(req, res);
        expect(JSON.parse(res._getData())).toMatchObject({ error: "Forbidden" });

        expect(res.statusCode).toBe(403);
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
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [{ id: 1, email: "oneEmail@cds.ca", active: true }],

          users: [
            {
              id: "1",
            },
          ],
        });
        await apiUsers(req, res);
        expect(JSON.parse(res._getData())).toMatchObject([
          { id: 1, email: "oneEmail@cds.ca", active: true },
        ]);
        expect(res.statusCode).toBe(200);
      });

      it("Should return an empty array if form has no emails associated", async () => {
        // Mocking executeQuery to return an empty list
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [],

          users: [
            {
              id: "1",
            },
          ],
        });

        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          query: {
            form: "99",
          },
        });

        await apiUsers(req, res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res._getData())).toEqual([]);
      });

      it("Should return 404 as statusCode if there's db's error", async () => {
        // Mocking prisma to throw an error
        prismaMock.template.findUnique.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError("Can't reach database server", {
            code: "P1001",
            clientVersion: "4.3.2",
          })
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

        await apiUsers(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res._getData()).error).toEqual("Form Not Found");
      });
    });
    describe("Manage All Forms Permissions", () => {
      beforeEach(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms user",
            privileges: mockUserPrivileges(ManageForms, { user: { id: "1" } }),
            acceptableUse: true,
          },
        };

        mockGetSession.mockResolvedValue(mockSession);
      });
      afterEach(() => mockGetSession.mockReset());
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

        await apiUsers(req, res);
        expect(JSON.parse(res._getData()).error).toEqual("Malformed API Request FormID not define");
        expect(res.statusCode).toBe(400);
      });

      it("Should return all the emails associated with the form ID.", async () => {
        // Mocking query to return a list of emails

        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [
            { id: 1, email: "test@cds.ca", active: true },
            { id: 2, email: "forms@cds.ca", active: false },
          ],

          users: [
            {
              id: "1",
            },
          ],
        });

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
        await apiUsers(req, res);
        expect(JSON.parse(res._getData())).toEqual([
          { id: 1, email: "test@cds.ca", active: true },
          { id: 2, email: "forms@cds.ca", active: false },
        ]);

        expect(res.statusCode).toBe(200);
      });
      it("Should allow a user to view a non-owned form", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [
            { id: 1, email: "test@cds.ca", active: true },
            { id: 2, email: "forms@cds.ca", active: false },
          ],

          users: [
            {
              id: "2",
            },
          ],
        });

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
        await apiUsers(req, res);
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
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [{ id: 1, email: "oneEmail@cds.ca", active: true }],

          users: [
            {
              id: "1",
            },
          ],
        });
        await apiUsers(req, res);
        expect(JSON.parse(res._getData())).toMatchObject([
          { id: 1, email: "oneEmail@cds.ca", active: true },
        ]);
        expect(res.statusCode).toBe(200);
      });

      it("Should return an empty array if form has no emails associated", async () => {
        // Mocking executeQuery to return an empty list
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          apiUsers: [],

          users: [
            {
              id: "1",
            },
          ],
        });

        const { req, res } = createMocks({
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          query: {
            form: "99",
          },
        });

        await apiUsers(req, res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res._getData())).toEqual([]);
      });

      it("Should return 404 as statusCode if there's db's error", async () => {
        // Mocking prisma to throw an error
        prismaMock.template.findUnique.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError("Can't reach database server", {
            code: "P1001",
            clientVersion: "4.3.2",
          })
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

        await apiUsers(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res._getData()).error).toEqual("Form Not Found");
      });
    });
  });
  describe("PUT: Activate and deactivate a form's owners API endpoint", () => {
    describe("Base Permissions", () => {
      beforeEach(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms user",
            privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
            acceptableUse: true,
          },
        };

        mockGetSession.mockResolvedValue(mockSession);
      });
      afterEach(() => mockGetSession.mockReset());

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
        await apiUsers(req, res);
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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Invalid payload fields are not define" })
        );
      });

      it("Should return 404 Email Not Found", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });
        // Mocking prisma to throw an error
        prismaMock.apiUser.update.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError("Unknown User", {
            code: "P2025",
            clientVersion: "4.3.2",
          })
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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Email Not Found" })
        );
      });

      it("Should return 404 Form Not Found", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Form Not Found" })
        );
      });
      test.each([0, 1])(
        "Should return 200 status code: owners are deactivated/activated for owned forms",
        async (elem) => {
          (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
            users: [
              {
                id: "1",
              },
            ],
          });
          //Mocking prisma
          (prismaMock.apiUser.update as jest.MockedFunction<any>).mockResolvedValue({
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

          await apiUsers(req, res);
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res._getData())).toMatchObject({ id: elem, active: true });
        }
      );
      test.each([0, 1])("Should return 403 status code as user does not own form", async (elem) => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "2",
            },
          ],
        });
        //Mocking prisma
        (prismaMock.apiUser.update as jest.MockedFunction<any>).mockResolvedValue({
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

        await apiUsers(req, res);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toMatchObject({ error: "Forbidden" });
      });
    });
    describe("ManageForms Permissions", () => {
      beforeEach(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms user",
            privileges: mockUserPrivileges(ManageForms, { user: { id: "1" } }),
            acceptableUse: true,
          },
        };

        mockGetSession.mockResolvedValue(mockSession);
      });
      afterEach(() => mockGetSession.mockReset());

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
        await apiUsers(req, res);
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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Invalid payload fields are not define" })
        );
      });

      it("Should return 404 Email Not Found", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });
        // Mocking prisma to throw an error
        prismaMock.apiUser.update.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError("Unknown User", {
            code: "P2025",
            clientVersion: "4.3.2",
          })
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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Email Not Found" })
        );
      });

      it("Should return 404 Form Not Found", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(404);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Form Not Found" })
        );
      });
      test.each([0, 1])(
        "Should return 200 status code: owners are deactivated/activated for forms owned",
        async (elem) => {
          (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
            users: [
              {
                id: "1",
              },
            ],
          });
          //Mocking prisma
          (prismaMock.apiUser.update as jest.MockedFunction<any>).mockResolvedValue({
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

          await apiUsers(req, res);
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res._getData())).toMatchObject({ id: elem, active: true });
        }
      );
      test.each([0, 1])(
        "Should return 200 status code: owners are deactivated/activated for forms not owned",
        async (elem) => {
          (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
            users: [
              {
                id: "2",
              },
            ],
          });
          //Mocking prisma
          (prismaMock.apiUser.update as jest.MockedFunction<any>).mockResolvedValue({
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

          await apiUsers(req, res);
          expect(res.statusCode).toBe(200);
          expect(JSON.parse(res._getData())).toMatchObject({ id: elem, active: true });
        }
      );
    });
  });

  describe("POST: Associate an email to a template data API endpoint", () => {
    describe("Base Permissions", () => {
      beforeEach(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds-snc.ca",
            name: "forms user",
            privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
            acceptableUse: true,
          },
        };

        mockGetSession.mockResolvedValue(mockSession);
      });
      afterEach(() => mockGetSession.mockReset());
      it("Should return 400 FormID doesn't exist or User already assigned in db", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });

        //Mocking db result by throwing constraint violation error.
        prismaMock.apiUser.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError("Unknown User", {
            code: "P2003",
            clientVersion: "4.3.2",
          })
        );

        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "888",
          },
        });
        await apiUsers(req, res);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({
            error: "The formID does not exist or User is already assigned",
          })
        );
      });

      it("Should create a new record and return 200 code along with the id", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });

        // return the id of the newly created record.

        (prismaMock.apiUser.create as jest.MockedFunction<any>).mockResolvedValue({
          id: 1,
        });
        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "9",
          },
        });
        await apiUsers(req, res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({
            success: {
              id: 1,
            },
          })
        );
      });
      it("Should not allow a new record if the user does not own the form", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "2",
            },
          ],
        });

        // return the id of the newly created record.

        (prismaMock.apiUser.create as jest.MockedFunction<any>).mockResolvedValue({
          id: 1,
        });
        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "9",
          },
        });
        await apiUsers(req, res);
        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({
            error: "Forbidden",
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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Malformed API Request FormID not define" })
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
          await apiUsers(req, res);
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res._getData())).toEqual(
            expect.objectContaining({ error: "The email is not a valid GC email" })
          );
        }
      );

      it("Should log admin activity if POST API call completed successfully", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });

        // return the id of the newly created record.
        (prismaMock.apiUser.create as jest.MockedFunction<any>).mockResolvedValue({
          id: 1,
        });

        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "9",
          },
        });

        await apiUsers(req, res);

        expect(res.statusCode).toBe(200);
      });
    });

    describe("ManageForm Permissions", () => {
      beforeEach(() => {
        const mockSession: Session = {
          expires: "1",
          user: {
            id: "1",
            email: "forms@cds.ca",
            name: "forms user",
            privileges: mockUserPrivileges(ManageForms, { user: { id: "1" } }),
            acceptableUse: true,
          },
        };

        mockGetSession.mockResolvedValue(mockSession);
      });
      afterEach(() => mockGetSession.mockReset());
      it("Should return 400 FormID doesn't exist or User already assigned in db", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });

        //Mocking db result by throwing constraint violation error.
        prismaMock.apiUser.create.mockRejectedValue(
          new Prisma.PrismaClientKnownRequestError("Unknown User", {
            code: "P2003",
            clientVersion: "4.3.2",
          })
        );

        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "888",
          },
        });
        await apiUsers(req, res);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({
            error: "The formID does not exist or User is already assigned",
          })
        );
      });

      it("Should create a new record and return 200 code along with the id", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });

        // return the id of the newly created record.

        (prismaMock.apiUser.create as jest.MockedFunction<any>).mockResolvedValue({
          id: 1,
        });
        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "9",
          },
        });
        await apiUsers(req, res);
        expect(res.statusCode).toBe(200);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({
            success: {
              id: 1,
            },
          })
        );
      });
      it("Should allow a new record if the user does not own the form", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "2",
            },
          ],
        });

        // return the id of the newly created record.

        (prismaMock.apiUser.create as jest.MockedFunction<any>).mockResolvedValue({
          id: 1,
        });
        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "9",
          },
        });
        await apiUsers(req, res);
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
        await apiUsers(req, res);
        expect(res.statusCode).toBe(400);
        expect(JSON.parse(res._getData())).toEqual(
          expect.objectContaining({ error: "Malformed API Request FormID not define" })
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
          await apiUsers(req, res);
          expect(res.statusCode).toBe(400);
          expect(JSON.parse(res._getData())).toEqual(
            expect.objectContaining({ error: "The email is not a valid GC email" })
          );
        }
      );

      it("Should log admin activity if POST API call completed successfully", async () => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          users: [
            {
              id: "1",
            },
          ],
        });

        // return the id of the newly created record.
        (prismaMock.apiUser.create as jest.MockedFunction<any>).mockResolvedValue({
          id: 1,
        });

        const { req, res } = createMocks({
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: {
            email: "forms@cds-snc.ca",
          },
          query: {
            form: "9",
          },
        });

        await apiUsers(req, res);

        expect(res.statusCode).toBe(200);
      });
    });
  });
});
