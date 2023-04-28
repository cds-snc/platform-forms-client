/**
 * @jest-environment node
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import Redis from "ioredis-mock";
import templates from "@pages/api/templates/[formID]";
import templatesRoot from "@pages/api/templates/index";
import { getServerSession } from "next-auth/next";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import validFormTemplateWithHTMLInDynamicRow from "../../__fixtures__/validFormTemplateWithHTMLInDynamicRow.json";
import brokenFormTemplate from "../../__fixtures__/brokenFormTemplate.json";
import { prismaMock } from "@jestUtils";
import { Session } from "next-auth";
import { Base, mockUserPrivileges, ManageForms, PublishForms } from "__utils__/permissions";
import { numberOfUnprocessedSubmissions } from "@lib/vault";

//Needed in the typescript version of the test so types are inferred correctly
const mockGetSession = jest.mocked(getServerSession, { shallow: true });

jest.mock("next-auth/next");

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

jest.mock("@lib/vault");

const mockNumberOfUnprocessedSubmissions = jest.mocked(numberOfUnprocessedSubmissions, {
  shallow: true,
});

describe("Requires a valid session to access API", () => {
  it("Should successfully handle a POST request to create a template", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formConfig: brokenFormTemplate,
      },
    });

    await templates(req, res);

    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res._getData())).toMatchObject({ error: "Unauthorized" });
  });
});

describe("Test templates API functions", () => {
  describe.each([[Base], [ManageForms]])("POST", (privileges) => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: privileges,
          acceptableUse: true,
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => {
      mockGetSession.mockReset();
    });

    it("Should successfully handle a POST request to create a template", async () => {
      (prismaMock.template.create as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
      });

      (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
      });

      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formConfig: validFormTemplate,
        },
      });

      await templatesRoot(req, res);

      expect(res.statusCode).toBe(200);
    });

    it("Should fail with invalid JSON", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formConfig: brokenFormTemplate,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData()).error).toContain(
        'JSON Validation Error: instance requires property "privacyPolicy",instance requires property "confirmation"'
      );
    });

    it("Should reject JSON with html", async () => {
      const { req, res } = createMocks({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formConfig: validFormTemplateWithHTMLInDynamicRow,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData()).error).toContain("HTML detected in JSON");
    });
  });

  describe.each([[Base], [ManageForms]])("PUT", (privileges) => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: mockUserPrivileges(privileges, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => {
      mockGetSession.mockReset();
    });

    it("Should successfully handle PUT request", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
      });

      (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
      });

      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formConfig: validFormTemplate,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(200);
    });

    it("Should failed when trying to update published template", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
        isPublished: true,
      });

      (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
      });

      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formConfig: validFormTemplate,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(409);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Can't update published form" })
      );
    });

    it("Should successfully handle PUT request that removes the DeliveryOption object", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
      });

      (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
      });

      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          sendResponsesToVault: true,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(200);
    });
  });

  describe("PUT API that modifies `isPublished`", () => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: mockUserPrivileges(PublishForms, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => {
      mockGetSession.mockReset();
    });

    it("Should successfully handle PUT request", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
      });

      (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
        isPublished: true,
      });

      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          isPublished: true,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(200);
    });
  });

  describe.each([[Base], [ManageForms]])("DELETE", (privileges) => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: mockUserPrivileges(privileges, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => {
      mockGetSession.mockReset();
    });

    it("Should successfully handle DELETE request", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
      });

      (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
      });

      const { req, res } = createMocks({
        method: "DELETE",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(200);
    });

    it("Should return specific error message when trying to delete form that has unprocessed submissions", async () => {
      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
      });

      (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
        id: "test0form00000id000asdf11",
        jsonConfig: validFormTemplate,
      });

      mockNumberOfUnprocessedSubmissions.mockResolvedValueOnce(1);

      const { req, res } = createMocks({
        method: "DELETE",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(405);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Found unprocessed submissions" })
      );
    });
  });
});

describe("Templates API functions should throw an error if user does not have permissions", () => {
  describe("Templates API functions should throw an error if user does not have any permissions", () => {
    beforeAll(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: [],
          acceptableUse: true,
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));
    });

    afterAll(() => {
      mockGetSession.mockReset();
    });

    // base routes
    it.each(["GET", "POST"])(
      "User with no permission should not be able to use %s API functions",
      async (httpMethod) => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          id: "formtestID",
          jsonConfig: validFormTemplate,
          users: [{ id: "1" }],
        });

        const url = "/api/templates";

        const { req, res } = createMocks({
          method: httpMethod as RequestMethod,
          url: url,
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: {
            formConfig: validFormTemplate,
          },
        });

        await templatesRoot(req, res);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
      }
    );

    // resource-specific routes
    it.each(["GET", "PUT", "DELETE"])(
      "User with no permission should not be able to use %s API functions",
      async (httpMethod) => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          id: "formtestID",
          jsonConfig: validFormTemplate,
          users: [{ id: "1" }],
        });

        const url = "/api/templates/test0form00000id000asdf11";

        const { req, res } = createMocks({
          method: httpMethod as RequestMethod,
          url: url,
          query: {
            formID: "test0form00000id000asdf11",
          },
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: {
            formConfig: validFormTemplate,
          },
        });

        await templates(req, res);

        expect(res.statusCode).toBe(403);
        expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
      }
    );
  });

  describe("Templates API functions should throw an error if user does not have sufficient permissions", () => {
    afterAll(() => {
      mockGetSession.mockReset();
    });

    it("User with no relation to the template being interacted with should not be able to use the PUT API function", async () => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "forms@cds.ca",
          name: "forms",
          privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));

      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "2" }],
      });

      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formConfig: validFormTemplate,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
    });

    it("User with no relation to the template being interacted with should not be able to use the PUT API function that modifies `isPublished`", async () => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "forms@cds.ca",
          name: "forms",
          privileges: mockUserPrivileges(PublishForms, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));

      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "2" }],
      });

      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          isPublished: true,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
    });

    it("User with no relation to the template being interacted with should not be able to use the DELETE API function", async () => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "forms@cds.ca",
          name: "forms",
          privileges: mockUserPrivileges(Base, { user: { id: "1" } }),
          acceptableUse: true,
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));

      (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "2" }],
      });

      const { req, res } = createMocks({
        method: "DELETE",
        url: "/api/templates/test0form00000id000asdf11",
        query: {
          formID: "test0form00000id000asdf11",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
    });
  });
});
