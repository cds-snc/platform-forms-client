import { prismaMock } from "@testUtils";
import {
  getAppSetting,
  getAppSettingAsBoolean,
  getAllAppSettings,
  updateAppSettingValue,
} from "@lib/appSettings";
import { AccessControlError } from "@lib/auth/errors";
import * as settingCache from "@lib/cache/settingCache";
import { logEvent } from "@lib/auditLogs";
import { mockAuthorizationFail, mockAuthorizationPass } from "__utils__/authorization";

vi.mock("@lib/auditLogs", async () => {
  const actual = await vi.importActual<typeof import("@lib/auditLogs")>("@lib/auditLogs");
  return {
    ...actual,
    logEvent: vi.fn(),
  };
});

vi.mock("@lib/privileges");

vi.mock("@lib/cache/settingCache", async () => {
  const actual =
    await vi.importActual<typeof import("@lib/cache/settingCache")>("@lib/cache/settingCache");
  return { ...actual };
});

const mockedLogEvent = vi.mocked(logEvent);
const userId = "1";

describe("Application Settings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthorizationPass(userId);
    vi.spyOn(settingCache, "settingCheck").mockResolvedValue(null);
    vi.spyOn(settingCache, "settingPut").mockResolvedValue(undefined);
  });

  test("gets application settings from cache or database", async () => {
    prismaMock.setting.findUnique.mockResolvedValue({
      internalId: "testSetting",
      nameEn: "Test Setting",
      nameFr: "[FR] Test Setting",
      descriptionEn: null,
      descriptionFr: null,
      type: "string",
      groupEn: null,
      groupFr: null,
      value: "123",
    });

    await expect(getAppSetting("testSetting")).resolves.toBe("123");
    expect(settingCache.settingCheck).toHaveBeenCalledWith("testSetting");
    expect(settingCache.settingPut).toHaveBeenCalledWith("testSetting", "123");
    expect(mockedLogEvent).not.toHaveBeenCalled();
  });

  test.each([
    ["true", true],
    ["ON", true],
    ["false", false],
    ["OFF", false],
    [null, false],
  ])("reads boolean setting value %s as %s", async (value, expected) => {
    vi.mocked(settingCache.settingCheck).mockResolvedValue(value);
    if (value === null) {
      prismaMock.setting.findUnique.mockResolvedValue({
        internalId: "featureEnabled",
        nameEn: "Feature enabled",
        nameFr: "Fonction activée",
        descriptionEn: null,
        descriptionFr: null,
        type: "boolean",
        groupEn: null,
        groupFr: null,
        value: null,
      });
    }
    await expect(getAppSettingAsBoolean("featureEnabled")).resolves.toBe(expected);
  });

  test("lists typed and grouped settings", async () => {
    prismaMock.setting.findMany.mockResolvedValue([
      {
        internalId: "zeta",
        nameEn: "Zulu Setting",
        nameFr: "Paramètre Zoulou",
        descriptionEn: null,
        descriptionFr: null,
        type: "string",
        groupEn: null,
        groupFr: null,
        value: null,
      },
      {
        internalId: "testSetting",
        nameEn: "Test Setting",
        nameFr: "[FR] Test Setting",
        descriptionEn: null,
        descriptionFr: null,
        type: "number",
        groupEn: "Example",
        groupFr: "Exemple",
        value: "123",
      },
      {
        internalId: "alpha",
        nameEn: "Alpha Setting",
        nameFr: "Paramètre Alpha",
        descriptionEn: null,
        descriptionFr: null,
        type: "boolean",
        groupEn: "Example",
        groupFr: "Exemple",
        value: "true",
      },
    ]);

    const settings = await getAllAppSettings();
    expect(settings.map(({ internalId }) => internalId)).toEqual(["alpha", "testSetting", "zeta"]);
    expect(settings[1]).toMatchObject({
      type: "number",
      groupEn: "Example",
      groupFr: "Exemple",
    });
    expect(mockedLogEvent).toHaveBeenCalledWith(userId, { type: "Setting" }, "ListAllSettings");
  });

  test("updates only a valid setting value and refreshes its cache", async () => {
    prismaMock.setting.findUnique.mockResolvedValue({
      internalId: "testSetting",
      nameEn: "Test Setting",
      nameFr: "[FR] Test Setting",
      descriptionEn: null,
      descriptionFr: null,
      type: "number",
      groupEn: null,
      groupFr: null,
      value: "1",
    });
    prismaMock.setting.update.mockResolvedValue({
      internalId: "testSetting",
      nameEn: "Test Setting",
      nameFr: "[FR] Test Setting",
      descriptionEn: null,
      descriptionFr: null,
      type: "number",
      groupEn: null,
      groupFr: null,
      value: "123",
    });

    await updateAppSettingValue("testSetting", "123");

    expect(prismaMock.setting.update).toHaveBeenCalledWith({
      where: { internalId: "testSetting" },
      data: { value: "123" },
    });
    expect(settingCache.settingPut).toHaveBeenCalledWith("testSetting", "123");
    expect(mockedLogEvent).toHaveBeenCalledWith(
      userId,
      { id: "testSetting", type: "Setting" },
      "ChangeSetting",
      "Updated setting with ${settingData}",
      { settingData: '{"value":"123"}' }
    );
  });

  test("rejects invalid values for the declared setting type", async () => {
    prismaMock.setting.findUnique.mockResolvedValue({
      internalId: "enabled",
      nameEn: "Enabled",
      nameFr: "Activé",
      descriptionEn: null,
      descriptionFr: null,
      type: "boolean",
      groupEn: null,
      groupFr: null,
      value: "false",
    });

    await expect(updateAppSettingValue("enabled", "yes")).rejects.toThrow(
      "Invalid boolean value for setting enabled"
    );
    expect(prismaMock.setting.update).not.toHaveBeenCalled();
  });

  test("requires setting management permission to update values", async () => {
    mockAuthorizationFail(userId);

    await expect(updateAppSettingValue("testSetting", "123")).rejects.toBeInstanceOf(
      AccessControlError
    );
    expect(prismaMock.setting.findUnique).not.toHaveBeenCalled();
    expect(prismaMock.setting.update).not.toHaveBeenCalled();
    expect(mockedLogEvent).toHaveBeenCalledWith(
      userId,
      { type: "Setting", id: "testSetting" },
      "AccessDenied",
      "Attempted to update setting"
    );
  });
});
