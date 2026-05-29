import type { MockedFunction } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from "@testUtils";
import { mockAuthorizationPass, mockGetAbility } from "__utils__/authorization";
import { cloneTemplate } from "../templates";
import { logEvent } from "@lib/auditLogs";

vi.mock("@lib/auditLogs", async () => {
  const __actual0 = await vi.importActual<any>("@lib/auditLogs");
  return {
  __esModule: true,
  logEvent: vi.fn(),
  AuditLogDetails: __actual0.AuditLogDetails,
  AuditLogAccessDeniedDetails: __actual0.AuditLogAccessDeniedDetails,};
});

vi.mock("@lib/privileges");

const mockedLogEvent = vi.mocked(logEvent);

describe("cloneTemplate", () => {
  const userID = "user1";

  beforeAll(() => {
    mockAuthorizationPass(userID);
    mockGetAbility(userID);
  });

  beforeEach(() => {
    (prismaMock.$transaction as MockedFunction<any>).mockImplementation((transaction: any) =>
      transaction(prismaMock)
    );
    (prismaMock.templateVersion.create as MockedFunction<any>).mockResolvedValue({ id: "new1-version-1" });
  });

  it("should create a copy of a template with user connected", async () => {
    const jsonConfig = { foo: "bar" };
    const sourceTemplate = {
      id: "src1",
      name: "Original",
      currentDraftVersionId: null,
      currentPublishedVersionId: "src1-version-1",
      currentDraftVersion: null,
      currentPublishedVersion: {
        id: "src1-version-1",
        versionNumber: 1,
        status: "PUBLISHED",
        jsonConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: new Date(),
        supersededAt: null,
        createdByUserId: null,
        publishedByUserId: null,
        publishReason: "",
        publishFormType: "",
        publishDesc: "",
      },
      isPublished: true,
      formPurpose: "",
      publishReason: "",
      publishFormType: "",
      publishDesc: "",
      securityAttribute: "Unclassified",
      saveAndResume: true,
      notificationsInterval: 1440,
      users: [{ id: "user1" }],
      // include the current user in notificationsUsers so cloning will connect them
      notificationsUsers: [{ id: "user2" }, { id: userID }],
    };

    (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue(sourceTemplate);

    const createdTemplate = {
      id: "new1",
      name: "Copy of Original",
      currentPublishedVersionId: null,
      currentDraftVersionId: "new1-version-1",
      currentPublishedVersion: null,
      currentDraftVersion: {
        id: "new1-version-1",
        versionNumber: 1,
        status: "DRAFT",
        jsonConfig,
        createdAt: new Date(),
        updatedAt: new Date(),
        publishedAt: null,
        supersededAt: null,
        createdByUserId: userID,
        publishedByUserId: null,
        publishReason: "",
        publishFormType: "",
        publishDesc: "",
      },
      isPublished: false,
      securityAttribute: sourceTemplate.securityAttribute,
      formPurpose: sourceTemplate.formPurpose,
      publishReason: sourceTemplate.publishReason,
      publishFormType: sourceTemplate.publishFormType,
      publishDesc: sourceTemplate.publishDesc,
      saveAndResume: sourceTemplate.saveAndResume,
      notificationsInterval: sourceTemplate.notificationsInterval,
    };

    (prismaMock.template.create as MockedFunction<any>).mockResolvedValue(createdTemplate);
    (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(createdTemplate);

    const result = await cloneTemplate("src1", false);

    expect(prismaMock.template.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: `Copy of ${sourceTemplate.name}`,
          users: { connect: [{ id: userID }] },
          // current user is in notificationsUsers in the source so they should be connected
          notificationsUsers: { connect: [{ id: userID }] },
        }),
        select: expect.any(Object),
      })
    );

    expect(prismaMock.templateVersion.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jsonConfig,
          status: "DRAFT",
          versionNumber: 1,
        }),
      })
    );

    expect(result).toEqual(expect.objectContaining({ id: "new1", form: jsonConfig }));
    expect(mockedLogEvent).toHaveBeenCalled();
  });
});
