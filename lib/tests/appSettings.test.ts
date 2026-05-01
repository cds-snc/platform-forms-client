import { prismaMock } from "@testUtils";
import {
  getAppSetting,
  getAllAppSettings,
  createAppSetting,
  updateAppSetting,
  deleteAppSetting,
} from "@lib/appSettings";

import { AccessControlError } from "@lib/auth/errors";

import * as settingCache from "@lib/cache/settingCache";

import { logEvent } from "@lib/auditLogs";

vi.mock("@lib/auditLogs", async () => {
  const __actual0 = await vi.importActual<typeof import("@lib/auditLogs")>("@lib/auditLogs");
  return {
  __esModule: true,
  logEvent: vi.fn(),
  AuditLogDetails: __actual0.AuditLogDetails,
  AuditLogAccessDeniedDetails: __actual0.AuditLogAccessDeniedDetails,};
});

import { mockAuthorizationFail, mockAuthorizationPass } from "__utils__/authorization";

const mockedLogEvent = vi.mocked(logEvent);
vi.mock("@lib/privileges");

// Needed because of a TypeScript error not allowing for non-default exported spyOn items.
vi.mock("@lib/cache/settingCache", async () => {
  const __actual0 = await vi.importActual<typeof import("@lib/cache/settingCache")>("@lib/cache/settingCache");
  return {
  __esModule: true,
  ...__actual0,
};
});

const userId = "1";

describe("Application Settings", () => {
  beforeEach(() => {
    mockAuthorizationPass(userId);
  });
  test("Get an application setting", async () => {
    const cacheSpy = vi.spyOn(settingCache, "settingCheck");
    prismaMock.setting.findUnique.mockResolvedValue({
      internalId: "testSetting",
      nameEn: "Test Setting",
      nameFr: "[FR] Test Setting",
      descriptionEn: null,
      descriptionFr: null,
      value: "123",
    });
    const setting = await getAppSetting("testSetting");

    // Ensure Cache is checked
    expect(cacheSpy).toHaveBeenCalled();
    expect(cacheSpy).toHaveBeenCalledWith("testSetting");

    expect(mockedLogEvent).not.toHaveBeenCalled();
    expect(setting).toEqual("123");
  });
  test("Get all application settings", async () => {
    prismaMock.setting.findMany.mockResolvedValue([
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
    const settings = await getAllAppSettings();
    // Ensure audit logging is called
    expect(mockedLogEvent).toHaveBeenCalledTimes(1);
    expect(mockedLogEvent).toHaveBeenCalledWith("1", { type: "Setting" }, "ListAllSettings");

    expect(settings).toMatchObject([
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
  describe("Create an application setting", () => {
    test("Create an application setting sucessfully", async () => {
      const cacheSpy = vi.spyOn(settingCache, "settingPut");

      const data = {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        value: "123",
      };

      prismaMock.setting.create.mockResolvedValue({
        ...data,
        descriptionEn: null,
        descriptionFr: null,
      });

      const newSetting = await createAppSetting(data);
      expect(cacheSpy).toHaveBeenCalledWith("testSetting", "123");
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userId,
        { id: "testSetting", type: "Setting" },
        "CreateSetting",
        'Created setting with ${settingData}',
        { settingData: '{"internalId":"testSetting","nameEn":"Test Setting","nameFr":"[FR] Test Setting","value":"123"}' }
      );
      expect(newSetting).toMatchObject({
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        value: "123",
      });
    });
    test("Only users with correct privileges can create app settings", async () => {
      mockAuthorizationFail(userId);
      const cacheSpy = vi.spyOn(settingCache, "settingPut");

      const data = {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        value: "123",
      };

      await expect(createAppSetting(data)).rejects.toBeInstanceOf(AccessControlError);
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userId,
        { type: "Setting" },
        "AccessDenied",
        "Attempted to create setting"
      );
      expect(cacheSpy).not.toHaveBeenCalled();
    });
  });
  describe("Update an application setting", () => {
    test("Update an application setting sucessfully", async () => {
      const cacheSpy = vi.spyOn(settingCache, "settingPut");

      const data = {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        value: "123",
      };

      prismaMock.setting.update.mockResolvedValue({
        ...data,
        descriptionEn: null,
        descriptionFr: null,
      });

      const newSetting = await updateAppSetting(data.internalId, data);
      expect(cacheSpy).toHaveBeenCalledWith("testSetting", "123");
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userId,
        { id: "testSetting", type: "Setting" },
        "ChangeSetting",
        'Updated setting with ${settingData}',
        { settingData: '{"internalId":"testSetting","nameEn":"Test Setting","nameFr":"[FR] Test Setting","value":"123"}' }
      );
      expect(newSetting).toMatchObject({
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        value: "123",
      });
    });
    test("Only users with correct privileges can update app settings", async () => {
      const cacheSpy = vi.spyOn(settingCache, "settingPut");
      mockAuthorizationFail(userId);

      const data = {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        value: "123",
      };

      await expect(updateAppSetting(data.internalId, data)).rejects.toBeInstanceOf(
        AccessControlError
      );

      expect(cacheSpy).not.toHaveBeenCalled();
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userId,
        { id: "testSetting", type: "Setting" },
        "AccessDenied",
        "Attempted to update setting"
      );
    });
  });
  describe("Delete an application setting", () => {
    test("Delete an application setting sucessfully", async () => {
      const cacheSpy = vi.spyOn(settingCache, "settingDelete");

      prismaMock.setting.delete.mockResolvedValue({
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        value: "123",
      });

      await deleteAppSetting("testSetting");
      expect(cacheSpy).toHaveBeenCalledWith("testSetting");
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userId,
        { id: "testSetting", type: "Setting" },
        "DeleteSetting",
        'Deleted setting with internalId: ${internalId}',
        { internalId: "testSetting" }
      );
    });
    test("Only users with correct privileges can delete app settings", async () => {
      const cacheSpy = vi.spyOn(settingCache, "settingDelete");
      mockAuthorizationFail(userId);

      await expect(deleteAppSetting("testSetting")).rejects.toBeInstanceOf(AccessControlError);

      expect(cacheSpy).not.toHaveBeenCalled();
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userId,
        { id: "testSetting", type: "Setting" },
        "AccessDenied",
        "Attempted to delete setting"
      );
    });
  });
});
