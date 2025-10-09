/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from "@jestUtils";
import { mockAuthorizationPass, mockGetAbility } from "__utils__/authorization";
import { cloneTemplate } from "../templates";
import { logEvent } from "@lib/auditLogs";

jest.mock("@lib/auditLogs");

const mockedLogEvent = jest.mocked(logEvent, { shallow: true });

describe("cloneTemplate", () => {
  const userID = "user1";

  beforeAll(() => {
    mockAuthorizationPass(userID);
    mockGetAbility(userID);
  });

  it("should create a copy of a template with user connected", async () => {
    const sourceTemplate = {
      id: "src1",
      name: "Original",
      jsonConfig: { foo: "bar" },
      isPublished: true,
      formPurpose: "",
      publishReason: "",
      publishFormType: "",
      publishDesc: "",
      securityAttribute: "Unclassified",
      saveAndResume: true,
      notificationsInterval: 1440,
      users: [{ id: "user1" }],
      notificationsUsers: [{ id: "user2" }],
    };

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(sourceTemplate);

    const createdTemplate = {
      id: "new1",
      name: "Copy of Original",
      jsonConfig: sourceTemplate.jsonConfig,
      isPublished: false,
      securityAttribute: sourceTemplate.securityAttribute,
      formPurpose: sourceTemplate.formPurpose,
      publishReason: sourceTemplate.publishReason,
      publishFormType: sourceTemplate.publishFormType,
      publishDesc: sourceTemplate.publishDesc,
      saveAndResume: sourceTemplate.saveAndResume,
      notificationsInterval: sourceTemplate.notificationsInterval,
    };

    (prismaMock.template.create as jest.MockedFunction<any>).mockResolvedValue(createdTemplate);

    const result = await cloneTemplate("src1");

    expect(prismaMock.template.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          jsonConfig: sourceTemplate.jsonConfig,
          name: `Copy of ${sourceTemplate.name}`,
          users: { connect: [{ id: userID }] },
          // notificationsUsers should not be copied because current user is not in the original list
        }),
        select: expect.any(Object),
      })
    );

    expect(result).toEqual(expect.objectContaining({ id: "new1", form: sourceTemplate.jsonConfig }));
    expect(mockedLogEvent).toHaveBeenCalled();
  });
});
