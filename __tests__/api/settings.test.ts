/**
 * @jest-environment node
 */
import { createMocks, RequestMethod } from "node-mocks-http";
import settings from "pages/api/settings/[settingId]";
import settingsRoot from "pages/api/settings/index";
import { getServerSession } from "next-auth/next";
import {
  getAllAppSettings,
  getAppSetting,
  updateAppSetting,
  deleteAppSetting,
  createAppSetting,
} from "@lib/appSettings";
import { Session } from "next-auth";
import {
  Base,
  mockUserPrivileges,
  ViewApplicationSettings,
  ManageApplicationSettings,
} from "__utils__/permissions";
import { logMessage } from "@lib/logger";
import { AccessControlError } from "@lib/privileges";

//Needed in the typescript version of the test so types are inferred correctly
const viewPrivileges = Base.concat(ViewApplicationSettings);
const managePrivileges = viewPrivileges.concat(ManageApplicationSettings);

const mockGetSession = jest.mocked(getServerSession, { shallow: true });
const mockGetAllAppSettings = jest.mocked(getAllAppSettings, { shallow: true });
const mockGetAppSetting = jest.mocked(getAppSetting, { shallow: true });
const mockUpdateAppSetting = jest.mocked(updateAppSetting, { shallow: true });
const mockDeleteAppSetting = jest.mocked(deleteAppSetting, { shallow: true });
const mockCreateAppSetting = jest.mocked(createAppSetting, { shallow: true });
const mockLogMessage = jest.mocked(logMessage, { shallow: false });

jest.mock("next-auth/next");
jest.mock("@lib/appSettings");
jest.mock("@lib/logger");

describe("Settings API", () => {
  describe("API Access checks", () => {
    test.each(["GET", "POST"])("Setting root access", async (httpMethod) => {
      const { req, res } = createMocks({
        method: httpMethod as RequestMethod,
        url: "/api/settings/",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      await settingsRoot(req, res);
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toMatchObject({ error: "Unauthorized" });
    });
    test.each(["PUT", "DELETE"])("Settings CRUD access", async (httpMethod) => {
      const { req, res } = createMocks({
        method: httpMethod as RequestMethod,
        url: "/api/settings/123",
        query: {
          settingId: "123",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      await settings(req, res);
      expect(res.statusCode).toBe(401);
      expect(JSON.parse(res._getData())).toMatchObject({ error: "Unauthorized" });
    });
    test("Can fetch value without session", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/settings/123",
        query: {
          settingId: "123",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      mockGetAppSetting.mockResolvedValue("123");
      await settings(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ setting: "123" });
    });
  });
  describe("Root settings API path functionality", () => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: mockUserPrivileges(managePrivileges, { user: { id: "1" } }),
          acceptableUse: true,
          hasSecurityQuestions: true,
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => {
      mockGetSession.mockReset();
    });
    test("Returns all settings sucessfully", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/settings/",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      mockGetAllAppSettings.mockResolvedValue([
        {
          internalId: "testSetting",
          nameEn: "Test Setting",
          nameFr: "[FR] Test Setting",
          descriptionEn: null,
          descriptionFr: null,
          value: "123",
        },
        {
          internalId: "testSetting 2",
          nameEn: "Test Setting 2",
          nameFr: "[FR] Test Setting 2",
          descriptionEn: null,
          descriptionFr: null,
          value: "456",
        },
      ]);
      await settingsRoot(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject([
        {
          internalId: "testSetting",
          nameEn: "Test Setting",
          nameFr: "[FR] Test Setting",
          descriptionEn: null,
          descriptionFr: null,
          value: "123",
        },
        {
          internalId: "testSetting 2",
          nameEn: "Test Setting 2",
          nameFr: "[FR] Test Setting 2",
          descriptionEn: null,
          descriptionFr: null,
          value: "456",
        },
      ]);
    });
    test("Creates a new setting", async () => {
      const { req, res } = createMocks({
        method: "POST",
        url: "/api/settings/",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          internalId: "testSetting",
          nameEn: "Test Setting",
          nameFr: "[FR] Test Setting",
          value: "123",
        },
      });

      mockCreateAppSetting.mockResolvedValue({
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        value: "123",
      });
      await settingsRoot(req, res);
      expect(mockCreateAppSetting).toHaveBeenCalledWith(expect.anything(), {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        value: "123",
      });
      expect(res.statusCode).toBe(201);
    });
    test("All required fields must be present", async () => {
      const { req, res } = createMocks({
        method: "POST",
        url: "/api/settings/",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          value: "123",
        },
      });
      await settingsRoot(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error:
          'JSON Validation Error: instance requires property "internalId",instance requires property "nameEn",instance requires property "nameFr"',
      });
    });
    test("Handles internal application errors on get all", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/settings/",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      mockGetAllAppSettings.mockRejectedValue(new Error("I'm an Error"));
      await settingsRoot(req, res);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Internal Server Error",
      });
      expect(mockLogMessage.error).toBeCalled();
      expect(mockLogMessage.error).toHaveBeenCalledWith(Error("I'm an Error"));
    });
    test("Handles internal application errors on create", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/settings/",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      mockCreateAppSetting.mockRejectedValue(new Error("I'm an Error"));
      await settingsRoot(req, res);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Internal Server Error",
      });
      expect(mockLogMessage.error).toBeCalled();
      expect(mockLogMessage.error).toHaveBeenCalledWith(Error("I'm an Error"));
    });
    test("Handles unauthorized errors from CRUD functions", async () => {
      const { req, res } = createMocks({
        method: "POST",
        url: "/api/settings/",
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          internalId: "testSetting",
          nameEn: "Test Setting",
          nameFr: "[FR] Test Setting",
          value: "123",
        },
      });
      mockCreateAppSetting.mockRejectedValue(new AccessControlError("Wrong Access"));
      await settingsRoot(req, res);
      expect(res.statusCode).toBe(403);
      expect(JSON.parse(res._getData())).toEqual({
        error: "Forbidden",
      });
      expect(mockLogMessage.error).toBeCalled();
      expect(mockLogMessage.error).toHaveBeenCalledWith(Error("Wrong Access"));
    });
  });
  describe("Settings Read / Update / Delete API functionality", () => {
    beforeEach(() => {
      const mockSession: Session = {
        expires: "1",
        user: {
          id: "1",
          email: "a@b.com",
          name: "Testing Forms",
          privileges: mockUserPrivileges(managePrivileges, { user: { id: "1" } }),
          acceptableUse: true,
          hasSecurityQuestions: true,
        },
      };

      mockGetSession.mockResolvedValue(mockSession);
    });

    afterEach(() => {
      mockGetSession.mockReset();
    });
    test("Can Get a specific application setting", async () => {
      const { req, res } = createMocks({
        method: "GET",
        url: "/api/settings/123",
        query: {
          settingId: "123",
        },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      mockGetAppSetting.mockResolvedValue("123");
      await settings(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toEqual({ setting: "123" });
    });
    test("Can update an application setting", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/settings/testSetting",
        query: { settingId: "testSetting" },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          internalId: "testSetting",
          nameEn: "Test Setting",
          nameFr: "[FR] Test Setting",
          value: "123",
        },
      });
      mockUpdateAppSetting.mockResolvedValue({
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        value: "123",
      });
      await settings(req, res);
      expect(res.statusCode).toBe(200);
      expect(JSON.parse(res._getData())).toMatchObject({
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        value: "123",
      });
    });
    test("Can delete a setting", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        url: "/api/settings/testSetting",
        query: { settingId: "testSetting" },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      mockDeleteAppSetting.mockResolvedValue();
      await settings(req, res);
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toBe("ok");
    });
    test("All required fields must be present for update", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/settings/testSetting",
        query: { settingId: "testSetting" },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          value: "123",
        },
      });
      await settings(req, res);
      expect(res.statusCode).toBe(400);
      expect(JSON.parse(res._getData())).toEqual({
        error:
          'JSON Validation Error: instance requires property "internalId",instance requires property "nameEn",instance requires property "nameFr"',
      });
    });
    test("Can handle internal application errors - Delete", async () => {
      const { req, res } = createMocks({
        method: "DELETE",
        url: "/api/settings/testSetting",
        query: { settingId: "testSetting" },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
      });
      mockDeleteAppSetting.mockRejectedValue(new Error("I'm an Error"));
      await settings(req, res);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: "Internal Server Error" });
    });
    test("Can handle internal application errors- Update", async () => {
      const { req, res } = createMocks({
        method: "PUT",
        url: "/api/settings/testSetting",
        query: { settingId: "testSetting" },
        headers: {
          "Content-Type": "application/json",
          Origin: "http://localhost:3000",
        },
        body: {
          internalId: "testSetting",
          nameEn: "Test Setting",
          nameFr: "[FR] Test Setting",
          value: "123",
        },
      });
      mockUpdateAppSetting.mockRejectedValue(new Error("I'm an Error"));
      await settings(req, res);
      expect(res.statusCode).toBe(500);
      expect(JSON.parse(res._getData())).toEqual({ error: "Internal Server Error" });
    });
  });
});
