/**
 * @jest-environment node
 */
import Redis from "ioredis-mock";
import { prismaMock } from "@jestUtils";
import {
  getAppSetting,
  getAllAppSettings,
  createAppSetting,
  updateAppSetting,
  deleteAppSetting,
} from "@lib/appSettings";
import { AccessControlError, createAbility } from "@lib/privileges";
import {
  Base,
  mockUserPrivileges,
  ViewApplicationSettings,
  ManageApplicationSettings,
} from "__utils__/permissions";
import * as settingCache from "@lib/cache/settingCache";
import { Session } from "next-auth";
import { logEvent } from "@lib/auditLogs";
jest.mock("@lib/auditLogs");
const mockedLogEvent = jest.mocked(logEvent, { shallow: true });
const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

// Needed because of a TypeScript error not allowing for non-default exported spyOn items.
jest.mock("@lib/cache/settingCache", () => ({
  __esModule: true,
  ...jest.requireActual("@lib/cache/settingCache"),
}));

const viewPrivilege = Base.concat(ViewApplicationSettings);
const managePrivilege = Base.concat(ViewApplicationSettings, ManageApplicationSettings);

describe("Application Settings", () => {
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
  test.each([[viewPrivilege], [managePrivilege]])(
    "Get all application settings",
    async (privilege) => {
      const fakeSession = {
        user: { id: "1", privileges: mockUserPrivileges(privilege, { user: { id: "1" } }) },
      };
      const ability = createAbility(fakeSession as Session);

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
      const settings = await getAllAppSettings(ability);
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
    }
  );
  describe("Create an application setting", () => {
    test("Create an application setting sucessfully", async () => {
      const cacheSpy = jest.spyOn(settingCache, "settingPut");
      const fakeSession = {
        user: { id: "1", privileges: mockUserPrivileges(managePrivilege, { user: { id: "1" } }) },
      };
      const ability = createAbility(fakeSession as Session);
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

      const newSetting = await createAppSetting(ability, data);
      expect(cacheSpy).toHaveBeenCalledWith("testSetting", "123");
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
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
      const cacheSpy = jest.spyOn(settingCache, "settingPut");
      const fakeSession = {
        user: {
          id: "1",
          privileges: mockUserPrivileges(viewPrivilege, { user: { id: "1" } }),
        },
      };
      const ability = createAbility(fakeSession as Session);
      const data = {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        value: "123",
      };

      await expect(async () => {
        await createAppSetting(ability, data);
      }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
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
      const fakeSession = {
        user: {
          id: "1",
          privileges: mockUserPrivileges(managePrivilege, { user: { id: "1" } }),
        },
      };
      const ability = createAbility(fakeSession as Session);
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

      const newSetting = await updateAppSetting(ability, data.internalId, data);
      expect(cacheSpy).toHaveBeenCalledWith("testSetting", "123");
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
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
      const fakeSession = {
        user: {
          id: "1",
          privileges: mockUserPrivileges(viewPrivilege, { user: { id: "1" } }),
        },
      };
      const ability = createAbility(fakeSession as Session);
      const data = {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        value: "123",
      };

      await expect(async () => {
        await updateAppSetting(ability, data.internalId, data);
      }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

      expect(cacheSpy).not.toHaveBeenCalled();
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { id: "testSetting", type: "Setting" },
        "AccessDenied",
        "Attempted to update setting"
      );
    });
  });
  describe("Delete an application setting", () => {
    test("Delete an application setting sucessfully", async () => {
      const cacheSpy = jest.spyOn(settingCache, "settingDelete");
      const fakeSession = {
        user: {
          id: "1",
          privileges: mockUserPrivileges(managePrivilege, { user: { id: "1" } }),
        },
      };
      const ability = createAbility(fakeSession as Session);

      prismaMock.setting.delete.mockResolvedValue({
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        value: "123",
      });

      await deleteAppSetting(ability, "testSetting");
      expect(cacheSpy).toHaveBeenCalledWith("testSetting");
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { id: "testSetting", type: "Setting" },
        "DeleteSetting",
        'Deleted setting with {"internalId":"testSetting","nameEn":"Test Setting","nameFr":"[FR] Test Setting","descriptionEn":null,"descriptionFr":null,"value":"123"}'
      );
    });
    test("Only users with correct privileges can delete app settings", async () => {
      const cacheSpy = jest.spyOn(settingCache, "settingDelete");
      const fakeSession = {
        user: {
          id: "1",
          privileges: mockUserPrivileges(viewPrivilege, { user: { id: "1" } }),
        },
      };
      const ability = createAbility(fakeSession as Session);

      await expect(async () => {
        await deleteAppSetting(ability, "testSetting");
      }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

      expect(cacheSpy).not.toHaveBeenCalled();
      // Ensure audit logging is called
      expect(mockedLogEvent).toHaveBeenCalledTimes(1);
      expect(mockedLogEvent).toHaveBeenCalledWith(
        "1",
        { id: "testSetting", type: "Setting" },
        "AccessDenied",
        "Attempted to delete setting"
      );
    });
  });
});
