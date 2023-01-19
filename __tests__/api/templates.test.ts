/**
 * @jest-environment node
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import Redis from "ioredis-mock";
import templates from "@pages/api/templates/[[...formID]]";
import { unstable_getServerSession } from "next-auth/next";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import validFormTemplateWithHTMLInDynamicRow from "../../__fixtures__/validFormTemplateWithHTMLInDynamicRow.json";
import brokenFormTemplate from "../../__fixtures__/brokenFormTemplate.json";
import { logAdminActivity } from "@lib/adminLogs";
import { prismaMock } from "@jestUtils";
import { Session } from "next-auth";
import { Base, getUserPrivileges, ManageForms, PublishForms } from "__utils__/permissions";

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(unstable_getServerSession, { shallow: true });

jest.mock("next-auth/next");
jest.mock("@lib/adminLogs");

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

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
  beforeAll(() => {
    process.env.TOKEN_SECRET = "testsecret";
  });

  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  describe.each([[Base], [ManageForms]])("POST", (privileges) => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: privileges,
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

      await templates(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        "1",
        "Create",
        "UploadForm",
        "Form id: test0form00000id000asdf11 has been uploaded"
      );
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
      expect(JSON.parse(res._getData()).error).toContain('instance requires property "form"');
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
          privileges: getUserPrivileges(privileges, { user: { id: "1" } }),
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
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formID: "test0form00000id000asdf11",
          formConfig: validFormTemplate,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        "1",
        "Update",
        "UpdateForm",
        "Form id: test0form00000id000asdf11 has been updated"
      );
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
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formID: "test0form00000id000asdf11",
          formConfig: validFormTemplate,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual(
        expect.objectContaining({ error: "Can't update published form" })
      );
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
          privileges: getUserPrivileges(PublishForms, { user: { id: "1" } }),
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
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formID: "test0form00000id000asdf11",
          isPublished: true,
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        "1",
        "Update",
        "UpdateForm",
        "Form id: test0form00000id000asdf11 'isPublished' value has been updated"
      );
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
          privileges: getUserPrivileges(privileges, { user: { id: "1" } }),
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
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formID: "test0form00000id000asdf11",
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(200);
      expect(logAdminActivity).toHaveBeenCalledWith(
        "1",
        "Delete",
        "DeleteForm",
        "Form id: test0form00000id000asdf11 has been deleted"
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
        },
      };
      mockGetSession.mockReturnValue(Promise.resolve(mockSession));
    });

    afterAll(() => {
      mockGetSession.mockReset();
    });

    it.each(["GET", "POST", "PUT", "DELETE"])(
      "User with no permission should not be able to use %s API functions",
      async (httpMethod) => {
        (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
          id: "formtestID",
          jsonConfig: validFormTemplate,
          users: [{ id: "1" }],
        });

        const { req, res } = createMocks({
          method: httpMethod as RequestMethod,
          headers: {
            "Content-Type": "application/json",
            Origin: "http://localhost:3000",
          },
          body: {
            ...(httpMethod !== "GET" && { formID: "test0form00000id000asdf11" }), // To target the getAllTemplates API when testing GET request
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
          privileges: getUserPrivileges(Base, { user: { id: "1" } }),
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
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formID: "test0form00000id000asdf11",
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
          privileges: getUserPrivileges(PublishForms, { user: { id: "1" } }),
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
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formID: "test0form00000id000asdf11",
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
          privileges: getUserPrivileges(Base, { user: { id: "1" } }),
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
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          formID: "test0form00000id000asdf11",
        },
      });

      await templates(req, res);

      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual(expect.objectContaining({ error: "Forbidden" }));
    });
  });
});
