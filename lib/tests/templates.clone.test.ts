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

  it("should create a copy of a template with delivery option and users connected", async () => {
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
      deliveryOption: {
        emailAddress: "a@b.com",
        emailSubjectEn: "sub en",
        emailSubjectFr: "sub fr",
      },
    };

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(sourceTemplate);

    const createdTemplate = {
      id: "new1",
      name: "Copy of Original",
      jsonConfig: sourceTemplate.jsonConfig,
      isPublished: false,
      deliveryOption: sourceTemplate.deliveryOption,
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
          users: { connect: [{ id: "user1" }] },
          deliveryOption: expect.any(Object),
          notificationsUsers: expect.any(Object),
        }),
        select: expect.any(Object),
      })
    );

    expect(result).toEqual(expect.objectContaining({ id: "new1", form: sourceTemplate.jsonConfig }));
    expect(mockedLogEvent).toHaveBeenCalled();
  });
});
