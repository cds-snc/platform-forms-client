/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @jest-environment node
 */

import Redis from "ioredis-mock";
import { prismaMock } from "@jestUtils";
import {
  createTemplate,
  getAllTemplates,
  getPublicTemplateByID,
  getFullTemplateByID,
  updateTemplate,
  deleteTemplate,
  getTemplateDeliveryOptionByID,
  onlyIncludePublicProperties,
  updateIsPublishedForTemplate,
  getTemplateWithAssociatedUsers,
  updateAssignedUsersForTemplate,
  TemplateAlreadyPublishedError,
  removeDeliveryOption,
} from "../templates";

import { DeliveryOption, FormProperties, FormRecord } from "@lib/types";
import formConfiguration from "@jestFixtures/cdsIntakeTestForm.json";

// structuredClone is available starting in Node 17.
// Until we catch up... polyfill
import v8 from "v8";
import { Prisma } from "@prisma/client";
import { AccessControlError, createAbility } from "@lib/privileges";
import {
  Base,
  getUserPrivileges,
  ManageForms,
  ManageUsers,
  PublishForms,
  ViewUserPrivileges,
} from "__utils__/permissions";
import { Session } from "next-auth";

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

jest.mock("@lib/auditLogs", () => ({
  logEvent: jest.fn(),
}));

const structuredClone = <T>(obj: T): T => {
  return v8.deserialize(v8.serialize(obj));
};

const buildPrismaResponse = (
  id: string,
  jsonConfig: object,
  isPublished = false,
  deliveryOption?: DeliveryOption,
  securityAttribute = "Unclassified"
) => {
  return {
    id,
    jsonConfig,
    deliveryOption,
    isPublished,
    securityAttribute,
  };
};

describe("Template CRUD functions", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "testsecret";
  });

  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  it.each([[Base], [ManageForms]])("Create a Template", async (privileges) => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(privileges, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.create as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    const newTemplate = await createTemplate(ability, "1", formConfiguration as FormProperties);

    expect(prismaMock.template.create).toHaveBeenCalledWith({
      data: {
        jsonConfig: formConfiguration,
        users: {
          connect: { id: "1" },
        },
      },
      select: {
        id: true,
      },
    });

    expect(newTemplate).toEqual({
      id: "formtestID",
      form: formConfiguration,
      isPublished: false,
      securityAttribute: "Unclassified",
    });
  });

  it.each([[Base], [ManageForms]])("Get multiple Templates", async (privileges) => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(privileges, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      buildPrismaResponse("formtestID", formConfiguration),
      buildPrismaResponse("formtestID2", formConfiguration),
    ]);

    const templates = await getAllTemplates(ability, "1");

    expect(templates).toEqual([
      {
        id: "formtestID",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      },
      {
        id: "formtestID2",
        form: formConfiguration,
        isPublished: false,
        securityAttribute: "Unclassified",
      },
    ]);
  });

  it.each([[Base], [ManageForms]])("No templates returned", async (privileges) => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(privileges, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([]);

    const template = await getAllTemplates(ability, "1");
    expect(template).toEqual([]);
  });

  it("Get all templates if user has the ManageForms privileges", async () => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(ManageForms, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      buildPrismaResponse("formtestID", formConfiguration),
    ]);

    await getAllTemplates(ability, "1");

    expect(prismaMock.template.findMany).toHaveBeenCalledWith({
      where: {
        ttl: null,
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
      },
    });
  });

  it("Get templates linked to the provided user if he has the Base privileges", async () => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(Base, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      buildPrismaResponse("formtestID", formConfiguration),
    ]);

    await getAllTemplates(ability, "1");

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
        securityAttribute: true,
      },
    });
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
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
        ttl: true,
      },
    });

    expect(template).toEqual({
      id: "formtestID",
      form: formConfiguration,
      isPublished: false,
      securityAttribute: "Unclassified",
    });
  });

  it("Get a full template", async () => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(Base, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    const template = await getFullTemplateByID(ability, "formTestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
        ttl: true,
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    expect(template).toEqual({
      id: "formtestID",
      form: formConfiguration,
      isPublished: false,
      securityAttribute: "Unclassified",
    });
  });

  it("Null returned when Template does not Exist", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

    const template = await getPublicTemplateByID("asdf");
    expect(template).toBe(null);
  });

  test("Get template by id returns null if item is marked as archived", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      ttl: new Date(),
    });

    const template = await getPublicTemplateByID("formtestID");

    expect(template).toBe(null);
  });

  it("Get Delivery Option object", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration, false, {
        emailAddress: "email@test.com",
        emailSubjectEn: "email subject in English",
        emailSubjectFr: "email subject in French",
      })
    );

    const deliveryOption = await getTemplateDeliveryOptionByID("formtestID");

    expect(deliveryOption).toEqual({
      emailAddress: "email@test.com",
      emailSubjectEn: "email subject in English",
      emailSubjectFr: "email subject in French",
    });
  });

  it("Get templates with associated users", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: getUserPrivileges(ManageForms.concat(ViewUserPrivileges), {
          user: { id: "1" },
        }),
      },
    };
    const ability = createAbility(fakeSession as Session);
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    await getTemplateWithAssociatedUsers(ability, "formtestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formtestID",
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
        ttl: true,
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  });

  it.each([[Base], [ManageForms]])("Update Template", async (privileges) => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(privileges, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    const updatedFormConfig = structuredClone(formConfiguration as FormProperties);

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", updatedFormConfig, true)
    );

    const updatedTemplate = await updateTemplate(ability, "test1", updatedFormConfig);

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
        securityAttribute: true,
      },
    });

    expect(updatedTemplate).toEqual({
      id: "formtestID",
      form: updatedFormConfig,
      isPublished: true,
      securityAttribute: "Unclassified",
    });
  });

  it("Update `isPublished` on a specific form", async () => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(PublishForms, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration, true)
    );

    const updatedTemplate = await updateIsPublishedForTemplate(ability, "formtestID", true);

    expect(prismaMock.template.update).toHaveBeenCalledWith({
      where: {
        id: "formtestID",
      },
      data: {
        isPublished: true,
      },
      select: {
        id: true,
        created_at: true,
        updated_at: true,
        name: true,
        jsonConfig: true,
        isPublished: true,
        deliveryOption: true,
        securityAttribute: true,
      },
    });

    expect(updatedTemplate).toEqual({
      id: "formtestID",
      form: formConfiguration,
      isPublished: true,
      securityAttribute: "Unclassified",
    });
  });

  it("Update assigned users for template", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: getUserPrivileges(ManageForms.concat(ManageUsers), { user: { id: "1" } }),
      },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration, true)
    );

    const users: { id: string; action: "add" | "remove" }[] = [
      { id: "1", action: "add" },
      { id: "2", action: "remove" },
    ];

    await updateAssignedUsersForTemplate(ability, "formTestID", users);

    expect(prismaMock.template.update).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      data: {
        users: {
          connect: [{ id: "1" }],
          disconnect: [{ id: "2" }],
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
        securityAttribute: true,
      },
    });
  });

  it("Updates to published forms are not allowed", async () => {
    const fakeSession = {
      user: {
        id: "1",
        privileges: getUserPrivileges(ManageForms.concat(ManageUsers), { user: { id: "1" } }),
      },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration, true),
      users: [{ id: "1" }],
    });

    const updatedFormConfig = structuredClone(formConfiguration as FormProperties);

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", updatedFormConfig, true)
    );

    await expect(async () => {
      await updateTemplate(ability, "test1", updatedFormConfig);
    }).rejects.toThrowError(new TemplateAlreadyPublishedError());
  });

  it.each([[Base], [ManageForms]])("Remove DeliveryOption from template", async (privileges) => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(privileges, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    const updatedTemplate = await removeDeliveryOption(ability, "formtestID");

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
          securityAttribute: true,
        },
      })
    );

    expect(updatedTemplate).toEqual({
      id: "formtestID",
      form: formConfiguration,
      isPublished: false,
      securityAttribute: "Unclassified",
    });
  });

  it.each([[Base], [ManageForms]])("Delete template", async (privileges) => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(privileges, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue(
      buildPrismaResponse("formtestID", formConfiguration)
    );

    const deletedTemplate = await deleteTemplate(ability, "formtestID");

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
          securityAttribute: true,
        },
      })
    );

    expect(deletedTemplate).toEqual({
      id: "formtestID",
      form: formConfiguration,
      isPublished: false,
      securityAttribute: "Unclassified",
    });
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
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges([], { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "1" }],
    });

    await expect(async () => {
      await createTemplate(ability, "1", formConfiguration as FormProperties);
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await getAllTemplates(ability, "1");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await getFullTemplateByID(ability, "1");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateTemplate(ability, "test1", structuredClone(formConfiguration as FormProperties));
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateIsPublishedForTemplate(ability, "formtestID", true);
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await removeDeliveryOption(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await deleteTemplate(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });

  it("User with no relation to the template being interacted with should not be able to use get, update and delete functions", async () => {
    const fakeSession = {
      user: { id: "1", privileges: getUserPrivileges(Base, { user: { id: "1" } }) },
    };
    const ability = createAbility(fakeSession as Session);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      ...buildPrismaResponse("formtestID", formConfiguration),
      users: [{ id: "2" }],
    });

    await expect(async () => {
      await getFullTemplateByID(ability, "1");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateTemplate(ability, "test1", structuredClone(formConfiguration as FormProperties));
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateIsPublishedForTemplate(ability, "formtestID", true);
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await removeDeliveryOption(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await deleteTemplate(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });
});
