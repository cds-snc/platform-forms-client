/**
 * @jest-environment node
 */

/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks } from "node-mocks-http";
import templates from "@pages/api/templates";
import { unstable_getServerSession } from "next-auth/next";
import validFormTemplate from "../../__fixtures__/validFormTemplate.json";
import brokenFormTemplate from "../../__fixtures__/brokenFormTemplate.json";
import { logAdminActivity } from "@lib/adminLogs";
import { prismaMock } from "@jestUtils";
import { UserRole } from "@prisma/client";

//Needed in the typescript version of the test so types are inferred correclty
const mockGetSession = jest.mocked(unstable_getServerSession, true);

jest.mock("next-auth/next");
jest.mock("@lib/adminLogs");

describe("Test JSON validation scenarios", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "testsecret";
  });

  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });
  beforeEach(() => {
    const mockSession = {
      expires: "1",
      user: { email: "a@b.com", name: "Testing Forms", role: UserRole.ADMINISTRATOR, userId: "1" },
    };

    mockGetSession.mockResolvedValue(mockSession);
  });
  afterEach(() => {
    mockGetSession.mockReset();
  });
  it("Should successfully handle a POST request to create a template", async () => {
    (prismaMock.template.create as jest.MockedFunction<any>).mockResolvedValue({
      id: "8",
      jsonConfig: validFormTemplate,
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "8",
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
      "Form id: 8 has been uploaded"
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

  it("Should successfully handle PUT request", async () => {
    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "8",
      jsonConfig: validFormTemplate,
    });

    const { req, res } = createMocks({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formID: "8",
        formConfig: validFormTemplate,
      },
    });

    await templates(req, res);

    expect(res.statusCode).toBe(200);
    expect(logAdminActivity).toHaveBeenCalledWith(
      "1",
      "Update",
      "UpdateForm",
      "Form id: 8 has been updated"
    );
  });

  it("Should successfully handle DELETE request", async () => {
    (prismaMock.template.delete as jest.MockedFunction<any>).mockResolvedValue({
      id: "8",
      jsonConfig: validFormTemplate,
    });

    const { req, res } = createMocks({
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        formID: "8",
      },
    });

    await templates(req, res);

    expect(res.statusCode).toBe(200);
    expect(logAdminActivity).toHaveBeenCalledWith(
      "1",
      "Delete",
      "DeleteForm",
      "Form id: 8 has been deleted"
    );
  });
});
