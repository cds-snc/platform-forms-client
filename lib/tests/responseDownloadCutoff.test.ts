import { mockClient } from "aws-sdk-client-mock";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getResponseDownloadCutoff } from "@lib/vault";
import { getAppSetting } from "@lib/appSettings";
import { mockAuthorizationFail, mockAuthorizationPass } from "__utils__/authorization";

const enforcement = vi.hoisted(() => ({ enabled: true }));
vi.mock("@root/constants", () => ({
  get ENFORCE_OVERDUE_RESPONSE_LIMITATION() {
    return enforcement.enabled;
  },
}));
vi.mock("@lib/appSettings");
vi.mock("@lib/privileges");

const ddbMock = mockClient(DynamoDBDocumentClient);
const now = Date.UTC(2026, 9, 22);
const cutoff = now - 36 * 86_400_000;
const downloadCutoff = now - 15.5 * 86_400_000;

describe("Overdue response download cutoff", () => {
  beforeEach(() => {
    vi.spyOn(Date, "now").mockReturnValue(now);
    enforcement.enabled = true;
    ddbMock.reset();
    mockAuthorizationPass("user-id");
    vi.mocked(getAppSetting).mockImplementation(async (key) =>
      key === "nagwarePhaseWarned" ? "35" : "15"
    );
    ddbMock.on(QueryCommand).resolves({ Items: [] });
  });

  afterEach(() => vi.restoreAllMocks());

  it.each(["New", "Downloaded"])(
    "restricts downloads when %s responses reach day 36",
    async (status) => {
      ddbMock
        .on(QueryCommand, {
          ExpressionAttributeValues: {
            ":formID": "form-id",
            ":start": `${status}#`,
            ":end": `${status}#${cutoff}`,
          },
        })
        .resolves({ Items: [{ FormID: "form-id" }] });

      expect(await getResponseDownloadCutoff("form-id")).toBe(downloadCutoff);
      const queries = ddbMock.commandCalls(QueryCommand).map((call) => call.args[0].input);
      expect(queries).toHaveLength(2);
      expect(queries.map((query) => query.ExpressionAttributeValues?.[":start"])).toEqual([
        "New#",
        "Downloaded#",
      ]);
      expect(queries.every((query) => query.Limit === 1 && !query.ExclusiveStartKey)).toBe(true);
    }
  );

  it("lifts the restriction when no overdue new or downloaded responses remain", async () => {
    expect(await getResponseDownloadCutoff("form-id")).toBeNull();
  });

  it("does not query responses or settings when enforcement is disabled", async () => {
    enforcement.enabled = false;
    expect(await getResponseDownloadCutoff("form-id")).toBeNull();
    expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(0);
    expect(getAppSetting).not.toHaveBeenCalled();
  });

  it("does not allow access to another user's form", async () => {
    mockAuthorizationFail("user-id");
    await expect(getResponseDownloadCutoff("form-id")).rejects.toThrow();
    expect(ddbMock.commandCalls(QueryCommand)).toHaveLength(0);
  });

  it.each([null, "", "invalid", "-1", "35.5"])("rejects invalid threshold %s", async (setting) => {
    vi.mocked(getAppSetting).mockResolvedValue(setting);
    await expect(getResponseDownloadCutoff("form-id")).rejects.toThrow(
      "Invalid nagwarePhaseWarned setting"
    );
  });

  it("propagates lookup failures instead of silently allowing downloads", async () => {
    ddbMock.on(QueryCommand).rejects(new Error("Vault unavailable"));
    await expect(getResponseDownloadCutoff("form-id")).rejects.toThrow("Vault unavailable");
  });

  it.each([null, "", "invalid", "-1", "15.5"])(
    "rejects invalid overdue eligibility threshold %s",
    async (setting) => {
      vi.mocked(getAppSetting).mockImplementation(async (key) =>
        key === "nagwarePhaseWarned" ? "35" : setting
      );
      await expect(getResponseDownloadCutoff("form-id")).rejects.toThrow(
        "Invalid nagwarePhaseEncouraged setting"
      );
    }
  );
});
