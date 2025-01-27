import { prismaMock } from "@jestUtils";
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
import { mockAuthorizationFail, mockAuthorizationPass } from "__utils__/authorization";

const mockedLogEvent = jest.mocked(logEvent, { shallow: true });
jest.mock("@lib/privileges");

// Needed because of a TypeScript error not allowing for non-default exported spyOn items.
jest.mock("@lib/cache/settingCache", () => ({
  __esModule: true,
  ...jest.requireActual("@lib/cache/settingCache"),
}));

const userId = "1";

describe("Application Settings", () => {
  beforeEach(() => {
    mockAuthorizationPass(userId);
  });
  test("Get an application setting", async () => {
    const cacheSpy = jest.spyOn(settingCache, "settingCheck");
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
      const cacheSpy = jest.spyOn(settingCache, "settingPut");

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
        'Created setting with {"internalId":"testSetting","nameEn":"Test Setting","nameFr":"[FR] Test Setting","value":"123"}'
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
      const cacheSpy = jest.spyOn(settingCache, "settingPut");

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
      const cacheSpy = jest.spyOn(settingCache, "settingPut");

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
        'Updated setting with {"internalId":"testSetting","nameEn":"Test Setting","nameFr":"[FR] Test Setting","value":"123"}'
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
      const cacheSpy = jest.spyOn(settingCache, "settingPut");
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
      const cacheSpy = jest.spyOn(settingCache, "settingDelete");

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
        'Deleted setting with {"internalId":"testSetting","nameEn":"Test Setting","nameFr":"[FR] Test Setting","descriptionEn":null,"descriptionFr":null,"value":"123"}'
      );
    });
    test("Only users with correct privileges can delete app settings", async () => {
      const cacheSpy = jest.spyOn(settingCache, "settingDelete");
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
