/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from "@jestUtils";
import {
  createTemplate,
  getAllTemplates,
  getAllTemplatesForUser,
  getPublicTemplateByID,
  getFullTemplateByID,
  updateTemplate,
  deleteTemplate,
  onlyIncludePublicProperties,
  updateIsPublishedForTemplate,
  getTemplateWithAssociatedUsers,
  updateAssignedUsersForTemplate,
  TemplateAlreadyPublishedError,
  removeDeliveryOption,
  TemplateHasUnprocessedSubmissions,
} from "../templates";

import { DeliveryOption, FormProperties, FormRecord, UserAbility } from "@lib/types";
import formConfiguration from "@jestFixtures/cdsIntakeTestForm.json";

// structuredClone is available starting in Node 17.
// Until we catch up... polyfill
import v8 from "v8";
import { Prisma } from "@prisma/client";

import { logEvent } from "@lib/auditLogs";
import { unprocessedSubmissions } from "@lib/vault";
import { deleteKey } from "@lib/serviceAccount";
import { authorizationCheck, AccessControlError } from "@lib/privileges";

jest.mock("@lib/privileges");
jest.mock("@lib/auditLogs");
jest.mock("@lib/actions/auth");
jest.mock("@lib/serviceAccount");

const mockedDeleteKey = jest.mocked(deleteKey, { shallow: true });

const mockedAuthorizationCheck = jest.mocked(authorizationCheck, { shallow: true });

const structuredClone = <T>(obj: T): T => {
  return v8.deserialize(v8.serialize(obj));
};

const mockedLogEvent = jest.mocked(logEvent, { shallow: true });

jest.mock("@lib/vault");

const mockUnprocessedSubmissions = jest.mocked(unprocessedSubmissions, {
  shallow: true,
});

/*
 * PurposeOption is used to determine the purpose of the form
 * admin: The form is used to collect personal information
 * nonAdmin: The form is used to collect non-personal information
 */
export enum PurposeOption {
  none = "",
  admin = "admin",
  nonAdmin = "nonAdmin",
}

const buildPrismaResponse = (
  id: string,
  jsonConfig: object,
  isPublished = false,
  deliveryOption?: DeliveryOption,
  formPurpose?: PurposeOption,
  securityAttribute = "Unclassified"
) => {
  return {
    id,
    jsonConfig,
    deliveryOption,
    formPurpose,
    isPublished,
    securityAttribute,
    users: [
      {
        id: "1",
        email: "test@cds-snc.ca",
      },
    ],
  };
};

const user1Ability = { userID: "1" } as unknown as UserAbility;

describe("Template CRUD functions", () => {
  it("Create a Template", async () => {
    (prismaMock.template.create as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration, false)
    );

    const newTemplate = await createTemplate({
      ability: user1Ability,
      userID: "1",
      formConfig: formConfiguration as FormProperties,
    });

    expect(prismaMock.template.create).toHaveBeenCalledWith({
      data: {
        jsonConfig: formConfiguration,
        users: {
          connect: { id: "1" },
        },
      },
      select: {
        id: true,
        created_at: true,
        deliveryOption: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        isPublished: true,
        jsonConfig: true,
        name: true,
        securityAttribute: true,
        updated_at: true,
      },
    });

    expect(newTemplate).toEqual(
      expect.objectContaining({
        id: "formtestID",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      })
    );

    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "CreateForm"
    );
  });

  it("Get multiple Templates", async () => {
    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      buildPrismaResponse("formtestID", formConfiguration),
      buildPrismaResponse("formtestID2", formConfiguration),
    ]);

    const templates = await getAllTemplates(user1Ability);

    expect(templates).toEqual([
      expect.objectContaining({
        id: "formtestID",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      }),
      expect.objectContaining({
        id: "formtestID2",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      }),
    ]);
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { type: "Form" },
      "ReadForm",
      "Accessed Forms: All System Forms"
    );
  });

  it("No templates returned", async () => {
    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([]);

    const template = await getAllTemplates(user1Ability);
    expect(template).toEqual([]);
    expect(mockedLogEvent).toHaveBeenCalledTimes(0);
  });

  it("Get templates linked to the provided user", async () => {
    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      buildPrismaResponse("formtestID", formConfiguration),
    ]);

    await getAllTemplatesForUser(user1Ability);

    expect(prismaMock.template.findMany).toHaveBeenCalledWith({
      where: {
        ttl: null,
        users: {
          some: {
            id: "1",
          },
        },
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        securityAttribute: true,
      },
    });
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { type: "Form" },
      "ReadForm",
      "Accessed Forms: formtestID"
    );
  });

  it("Get a public template", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    const template = await getPublicTemplateByID("formTestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      select: {
        id: true,
        closingDate: true,
        closedDetails: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        securityAttribute: true,
        ttl: true,
      },
    });

    expect(template).toEqual(
      expect.objectContaining({
        closingDate: undefined,
        id: "formtestID",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      })
    );
    expect(mockedLogEvent).toHaveBeenCalledTimes(0);
  });

  it("Get a full template", async () => {
    const template = await getFullTemplateByID(user1Ability, "formTestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      select: {
        id: true,
        closingDate: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        securityAttribute: true,
        ttl: true,
        users: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    expect(template).toEqual(
      expect.objectContaining({
        id: "formtestID",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      })
    );
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { type: "Form", id: "formTestID" },
      "ReadForm"
    );
  });

  it("Null returned when Template does not Exist", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

    const template = await getPublicTemplateByID("asdf");
    expect(template).toBe(null);
    expect(mockedLogEvent).toHaveBeenCalledTimes(0);
  });

  test("Get template by id returns null if item is marked as archived", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      ttl: new Date(),
    });

    const template = await getPublicTemplateByID("formtestID");

    expect(template).toBe(null);
  });

  it("Get templates with associated users", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    await getTemplateWithAssociatedUsers(user1Ability, "formtestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formtestID",
      },
      select: {
        id: true,
        closingDate: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        securityAttribute: true,
        ttl: true,
        users: {
          select: {
            email: true,
            id: true,
            name: true,
          },
        },
      },
    });
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "ReadForm",
      "Retrieved users associated with Form"
    );
  });

  it("Update Template", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("test1", formConfiguration),
      users: [{ id: "1" }],
    });

    const updatedFormConfig = structuredClone(formConfiguration as FormProperties);

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("test1", updatedFormConfig, true)
    );

    const updatedTemplate = await updateTemplate({
      ability: user1Ability,
      formID: "test1",
      formConfig: updatedFormConfig,
    });

    expect(prismaMock.template.update).toHaveBeenCalledWith({
      where: {
        id: "test1",
      },
      data: {
        jsonConfig: updatedFormConfig as unknown as Prisma.JsonObject,
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        securityAttribute: true,
      },
    });

    expect(updatedTemplate).toEqual(
      expect.objectContaining({
        id: "test1",
        form: updatedFormConfig,
        isPublished: true,
        securityAttribute: "Unclassified",
      })
    );
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { id: "test1", type: "Form" },
      "UpdateForm",
      "Form content updated"
    );
  });

  it("Update `isPublished` on a specific form", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration, true)
    );

    const updatedTemplate = await updateIsPublishedForTemplate(
      user1Ability,
      "formtestID",
      true,
      "",
      "",
      ""
    );

    expect(prismaMock.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "formtestID",
          isPublished: {
            not: true,
          },
        },
        data: {
          isPublished: true,
          publishReason: "",
          publishFormType: "",
          publishDesc: "",
        },
      })
    );

    expect(updatedTemplate).toEqual(
      expect.objectContaining({
        id: "formtestID",
        form: formConfiguration,
        isPublished: true,
        securityAttribute: "Unclassified",
      })
    );
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "PublishForm"
    );
  });

  it("Update assigned users for template", async () => {
    // Template has one user assigned to it to start
    (prismaMock.template.findFirst as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, true),
      users: [{ id: "1" }],
    });
    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration, true)
    );
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>).mockResolvedValueOnce({
      email: "user2@test.ca",
    });

    // We're just adding an additional user (2)
    const users: { id: string }[] = [{ id: "1" }, { id: "2" }];

    await updateAssignedUsersForTemplate(user1Ability, "formTestID", users);

    // Should just connect the new user
    expect(prismaMock.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "formTestID",
        },
        data: {
          users: {
            connect: [{ id: "2" }],
            disconnect: [],
          },
        },
      })
    );

    // should just log the new user
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      1,
      user1Ability.userID,
      { id: "formTestID", type: "Form" },
      "GrantFormAccess",
      "Access granted to user2@test.ca"
    );

    // Template has three users assigned to it to start
    const templateRecord = {
      ...buildPrismaResponse("formtestID", formConfiguration, true),
      users: [{ id: "2" }, { id: "3" }, { id: "4" }],
    };

    (prismaMock.template.findFirst as jest.MockedFunction<any>).mockResolvedValue(templateRecord);
    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration, true)
    );
    (prismaMock.user.findUniqueOrThrow as jest.MockedFunction<any>)
      .mockResolvedValueOnce({
        email: "user1@test.ca",
      })
      .mockResolvedValueOnce({
        email: "user2@test.ca",
      })
      .mockResolvedValueOnce({
        email: "user4@test.ca",
      });

    // We're removing two (2,4) and adding one (1)
    const users2: { id: string }[] = [{ id: "1" }, { id: "3" }];

    await updateAssignedUsersForTemplate(user1Ability, "formTestID", users2);

    // Connect 1, disconnect 2,4
    expect(prismaMock.template.update).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      data: {
        users: {
          connect: [{ id: "1" }],
          disconnect: [{ id: "2" }, { id: "4" }],
        },
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        formPurpose: true,
        publishReason: true,
        publishFormType: true,
        publishDesc: true,
        securityAttribute: true,
        users: true,
      },
    });

    // Log one added
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      2,
      user1Ability.userID,
      { id: "formTestID", type: "Form" },
      "GrantFormAccess",
      "Access granted to user1@test.ca"
    );

    // Log two removed
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      3,
      user1Ability.userID,
      { id: "formTestID", type: "Form" },
      "RevokeFormAccess",
      "Access revoked for user2@test.ca,user4@test.ca"
    );
  });

  it("Updates to published forms are not allowed", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, true),
      users: [{ id: "1" }],
    });

    const updatedFormConfig = structuredClone(formConfiguration as FormProperties);

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", updatedFormConfig, true)
    );

    await expect(async () => {
      await updateTemplate({
        ability: user1Ability,
        formID: "test1",
        formConfig: updatedFormConfig,
      });
    }).rejects.toThrow(TemplateAlreadyPublishedError);
    expect(mockedLogEvent).toHaveBeenCalledTimes(0);
  });

  it("Remove DeliveryOption from template", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, false, {
        emailAddress: "test@test.com",
      }),
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    const updatedTemplate = await removeDeliveryOption(user1Ability, "formtestID");

    expect(prismaMock.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "formtestID",
        },
        data: {
          deliveryOption: {
            delete: true,
          },
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          name: true,
          jsonConfig: true,
          isPublished: true,
          deliveryOption: true,
          formPurpose: true,
          publishReason: true,
          publishFormType: true,
          publishDesc: true,
          securityAttribute: true,
        },
      })
    );

    expect(updatedTemplate).toEqual(
      expect.objectContaining({
        id: "formtestID",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      })
    );
    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "ChangeDeliveryOption",
      "Delivery Option set to the Vault"
    );
  });

  it("Delete template", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    mockUnprocessedSubmissions.mockResolvedValueOnce(false);

    const deletedTemplate = await deleteTemplate(user1Ability, "formtestID");

    expect(prismaMock.template.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "formtestID",
        },
        data: {
          ttl: expect.any(Date),
        },
        select: {
          id: true,
          created_at: true,
          updated_at: true,
          name: true,
          jsonConfig: true,
          isPublished: true,
          deliveryOption: true,
          formPurpose: true,
          publishReason: true,
          publishFormType: true,
          publishDesc: true,
          securityAttribute: true,
        },
      })
    );

    expect(deletedTemplate).toEqual(
      expect.objectContaining({
        id: "formtestID",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      })
    );

    expect(mockedLogEvent).toHaveBeenCalledWith(
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "DeleteForm"
    );
    expect(mockedDeleteKey).toHaveBeenCalledTimes(1);
  });

  it("Template deletion should not be allowed if there are still unprocessed submissions associated to targeted form", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    mockUnprocessedSubmissions.mockResolvedValueOnce(true);

    await expect(async () => {
      await deleteTemplate(user1Ability, "formtestID");
    }).rejects.toThrow(TemplateHasUnprocessedSubmissions);
  });

  it("Only include public properties", async () => {
    const formRecord: FormRecord = {
      id: "testID",
      name: "Form Name",
      form: formConfiguration as FormProperties,
      isPublished: false,
      deliveryOption: {
        emailAddress: "test@email.com",
        emailSubjectEn: "email subject in English",
        emailSubjectFr: "email subject in French",
      },
      securityAttribute: "Unclassified",
    };

    const publicFormRecord = onlyIncludePublicProperties(formRecord);

    expect(publicFormRecord).toHaveProperty("id");
    expect(publicFormRecord).toHaveProperty("form");
    expect(publicFormRecord).toHaveProperty("isPublished");
    expect(publicFormRecord).toHaveProperty("securityAttribute");

    expect(publicFormRecord).not.toHaveProperty("deliveryOption");
  });

  it("User with no permission should not be able to use CRUD functions", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    mockedAuthorizationCheck.mockRejectedValue(
      new AccessControlError(`Access Control Forbidden Action`)
    );

    await expect(async () => {
      await createTemplate({
        ability: user1Ability,
        userID: "1",
        formConfig: formConfiguration as FormProperties,
      });
    }).rejects.toThrow(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await getAllTemplates(user1Ability);
    }).rejects.toThrow(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await getFullTemplateByID(user1Ability, "1");
    }).rejects.toThrow(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateTemplate({
        ability: user1Ability,
        formID: "test1",
        formConfig: structuredClone(formConfiguration as FormProperties),
      });
    }).rejects.toThrow(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateIsPublishedForTemplate(user1Ability, "formtestID", true, "", "", "");
    }).rejects.toThrow(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await removeDeliveryOption(user1Ability, "formtestID");
    }).rejects.toThrow(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await deleteTemplate(user1Ability, "formtestID");
    }).rejects.toThrow(new AccessControlError(`Access Control Forbidden Action`));
    expect(mockedLogEvent).toHaveBeenCalledTimes(7);
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      1,
      user1Ability.userID,
      { type: "Form" },
      "AccessDenied",
      "Attempted to create a Form"
    );
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      2,
      user1Ability.userID,
      { type: "Form" },
      "AccessDenied",
      "Attempted to list all Forms"
    );
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      3,
      user1Ability.userID,
      { id: "1", type: "Form" },
      "AccessDenied",
      "Attemped to read form object"
    );
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      4,
      user1Ability.userID,
      { id: "test1", type: "Form" },
      "AccessDenied",
      "Attempted to update Form"
    );
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      5,
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "AccessDenied",
      "Attempted to publish form"
    );
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      6,
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "AccessDenied",
      "Attempted to set Delivery Option to the Vault"
    );
    expect(mockedLogEvent).toHaveBeenNthCalledWith(
      7,
      user1Ability.userID,
      { id: "formtestID", type: "Form" },
      "AccessDenied",
      "Attempted to delete Form"
    );
  });
});
