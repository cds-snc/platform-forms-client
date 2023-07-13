/**
 * @jest-environment node
 */
/* eslint-disable  @typescript-eslint/no-explicit-any */
import { createMocks, RequestMethod } from "node-mocks-http";
import Redis from "ioredis-mock";
import overdue from "@pages/api/account/submissions/overdue";
import { getServerSession } from "next-auth/next";
import { Session } from "next-auth";
import { prismaMock } from "@jestUtils";
import validFormTemplate from "../../../../__fixtures__/validFormTemplate.json";
import { mockUserPrivileges, ViewUserPrivileges, Base, ManageForms } from "__utils__/permissions";
import { getAppSetting } from "@lib/appSettings";
import { listAllSubmissions } from "@lib/vault";
import { VaultStatus } from "@lib/types";

//Needed in the typescript version of the test so types are inferred correctly
const mockGetSession = jest.mocked(getServerSession, { shallow: true });
jest.mock("next-auth/next");

const redis = new Redis();

jest.mock("@lib/vault");

const mockListAllSubmissions = jest.mocked(listAllSubmissions, {
  shallow: true,
});

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

const mockGetAppSetting = jest.mocked(getAppSetting, { shallow: true });

jest.mock("@lib/appSettings");

describe("(without active session)", () => {
  it("Should not be able to use the API without an active session", async () => {
    const { req, res } = createMocks({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        managerEmail: "manager@cds-snc.ca",
        department: "department",
      },
    });

    await overdue(req, res);

    expect(res.statusCode).toEqual(403);
  });
});

describe("/api/account/submissions/overdue", () => {
  beforeEach(() => {
    const mockSession: Session = {
      expires: "1",
      user: {
        id: "1",
        email: "a@b.com",
        name: "Testing Forms",
        privileges: [
          ...mockUserPrivileges(Base, { user: { id: "1" } }),
          ...mockUserPrivileges(ViewUserPrivileges, { user: { id: "1" } }),
          ...mockUserPrivileges(ManageForms, { user: { id: "1" } }),
        ],
        acceptableUse: true,
      },
    };

    mockGetSession.mockResolvedValue(mockSession);
  });

  afterEach(() => {
    mockGetSession.mockReset();
  });

  it.each(["POST", "PUT", "DELETE"])(
    "Should not be able to use the API with unsupported HTTP methods",
    async (httpMethod) => {
      const { req, res } = createMocks({
        method: httpMethod as RequestMethod,
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          managerEmail: "manager@cds-snc.ca",
          department: "department",
        },
      });

      await overdue(req, res);

      expect(res.statusCode).toEqual(403);
    }
  );

  it("Should return true for overdue submissions", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        managerEmail: "manager@cds-snc.ca",
        department: "department",
        goals: "do something",
      },
    });

    (prismaMock.user.findFirstOrThrow as jest.MockedFunction<any>).mockResolvedValue({
      id: "1",
      email: "a@b.com",
      name: "Testing Forms",
      acceptableUse: true,
    });

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      {
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
      },
    ]);

    mockGetAppSetting.mockResolvedValue("25");

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: validFormTemplate,
      users: [{ id: "1", name: "Test test" }],
    });

    // has overdue submissions
    mockListAllSubmissions.mockResolvedValueOnce({
      submissions: [
        {
          formID: "formTestID",
          name: "Test test",
          status: VaultStatus.NEW,
          createdAt: 12345678,
          securityAttribute: "low",
          lastDownloadedBy: "1",
        },
      ],
      numberOfUnprocessedSubmissions: 1,
    });

    await overdue(req, res);

    const data = JSON.parse(res._getData());

    expect(res.statusCode).toEqual(200);
    expect(data.hasOverdueSubmissions).toEqual(true);
  });

  it("Should return false when no overdue submissions", async () => {
    const { req, res } = createMocks({
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:3000",
      },
      body: {
        managerEmail: "manager@cds-snc.ca",
        department: "department",
        goals: "do something",
      },
    });

    (prismaMock.user.findFirstOrThrow as jest.MockedFunction<any>).mockResolvedValue({
      id: "1",
      email: "a@b.com",
      name: "Testing Forms",
      acceptableUse: true,
    });

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      {
        id: "formtestID",
        jsonConfig: validFormTemplate,
        users: [{ id: "1" }],
      },
    ]);

    mockGetAppSetting.mockResolvedValue("25");

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: validFormTemplate,
      users: [{ id: "1", name: "Test test" }],
    });

    // no overdue submissions
    mockListAllSubmissions.mockResolvedValueOnce({
      submissions: [
        {
          formID: "formTestID",
          name: "Test test",
          status: VaultStatus.CONFIRMED,
          createdAt: 12345678,
          securityAttribute: "low",
          lastDownloadedBy: "1",
        },
      ],
      numberOfUnprocessedSubmissions: 1,
    });

    await overdue(req, res);

    const data2 = JSON.parse(res._getData());

    expect(res.statusCode).toEqual(200);
    expect(data2.hasOverdueSubmissions).toEqual(false);
  });
});
