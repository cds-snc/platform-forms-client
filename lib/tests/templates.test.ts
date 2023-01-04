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
  getTemplateSubmissionTypeByID,
  onlyIncludePublicProperties,
  updateIsPublishedForTemplate,
  getTemplateWithAssociatedUsers,
  updateAssignedUsersForTemplate,
  TemplateAlreadyPublishedError,
} from "../templates";

import { BetterOmit, FormRecord } from "@lib/types";
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

const redis = new Redis();

jest.mock("@lib/integration/redisConnector", () => ({
  getRedisInstance: jest.fn(() => redis),
}));

const structuredClone = <T>(obj: T): T => {
  return v8.deserialize(v8.serialize(obj));
};

describe("Template CRUD functions", () => {
  beforeAll(() => {
    process.env.TOKEN_SECRET = "testsecret";
  });

  afterAll(() => {
    delete process.env.TOKEN_SECRET;
  });

  it.each([[Base], [ManageForms]])("Create a Template", async (privileges) => {
    const ability = createAbility(getUserPrivileges(privileges, { user: { id: "1" } }));

    (prismaMock.template.create as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    const newTemplate = await createTemplate(
      ability,
      "1",
      formConfiguration as BetterOmit<FormRecord, "id" | "isPublished">
    );

    expect(prismaMock.template.create).toHaveBeenCalledWith({
      data: {
        jsonConfig: formConfiguration,
        users: {
          connect: { id: "1" },
        },
      },
    });

    expect(newTemplate).toEqual({
      id: "formtestID",
      ...formConfiguration,
    });
  });

  it.each([[Base], [ManageForms]])("Get multiple Templates", async (privileges) => {
    const ability = createAbility(getUserPrivileges(privileges, { user: { id: "1" } }));

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      {
        id: "formtestID",
        jsonConfig: formConfiguration,
      },
      {
        id: "formtestID2",
        jsonConfig: formConfiguration,
      },
    ]);

    const templates = await getAllTemplates(ability, "1");

    expect(templates).toEqual([
      {
        id: "formtestID",
        ...formConfiguration,
      },
      {
        id: "formtestID2",
        ...formConfiguration,
      },
    ]);
  });

  it.each([[Base], [ManageForms]])("No templates returned", async (privileges) => {
    const ability = createAbility(getUserPrivileges(privileges, { user: { id: "1" } }));

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([]);

    const template = await getAllTemplates(ability, "1");
    expect(template).toEqual([]);
  });

  it("Get all templates if user has the ManageForms privileges", async () => {
    const ability = createAbility(ManageForms);

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      {
        id: "formtestID",
        jsonConfig: formConfiguration,
      },
    ]);

    await getAllTemplates(ability, "1");

    expect(prismaMock.template.findMany).toHaveBeenCalledWith({
      where: {
        ttl: null,
      },
      select: {
        id: true,
        jsonConfig: true,
        isPublished: true,
        created_at: true,
        updated_at: true,
      },
    });
  });

  it("Get templates linked to the provided user if he has the Base privileges", async () => {
    const ability = createAbility(getUserPrivileges(Base, { user: { id: "1" } }));

    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      {
        id: "formtestID",
        jsonConfig: formConfiguration,
      },
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
        jsonConfig: true,
        isPublished: true,
        created_at: true,
        updated_at: true,
      },
    });
  });

  it("Get a public template", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    const template = await getPublicTemplateByID("formTestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      select: {
        id: true,
        jsonConfig: true,
        isPublished: true,
        ttl: true,
        updated_at: true,
      },
    });

    expect(template).toEqual(
      onlyIncludePublicProperties({
        id: "formtestID",
        ...formConfiguration,
      } as unknown as FormRecord)
    );
  });

  it("Get a full template", async () => {
    const ability = createAbility(getUserPrivileges(Base, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    const template = await getFullTemplateByID(ability, "formTestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      select: {
        id: true,
        jsonConfig: true,
        isPublished: true,
        ttl: true,
        users: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    expect(template).toEqual({ id: "formtestID", ...formConfiguration });
  });

  it("Null returned when Template does not Exist", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

    const template = await getPublicTemplateByID("asdf");
    expect(template).toBe(null);
  });

  test("Get template by id returns null if item is marked as archived", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      ttl: new Date(),
    });

    const template = await getPublicTemplateByID("formtestID");

    expect(template).toBe(null);
  });

  it("Get Submission Type", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      jsonConfig: formConfiguration,
    });

    const submissionType = await getTemplateSubmissionTypeByID("formtestID");

    expect(submissionType).toEqual(formConfiguration.submission);
  });

  it("Get templates with associated users", async () => {
    const ability = createAbility(
      getUserPrivileges(ManageForms.concat(ViewUserPrivileges), { user: { id: "1" } })
    );

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      jsonConfig: formConfiguration,
    });

    await getTemplateWithAssociatedUsers(ability, "formTestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      select: {
        id: true,
        jsonConfig: true,
        isPublished: true,
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
    const ability = createAbility(getUserPrivileges(privileges, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    const updatedFormConfig = structuredClone(
      formConfiguration as unknown as BetterOmit<FormRecord, "id" | "isPublished">
    );

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      isPublished: true,
      jsonConfig: updatedFormConfig,
    });

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
        jsonConfig: true,
        isPublished: true,
      },
    });

    expect(updatedTemplate).toEqual({
      id: "formtestID",
      isPublished: true,
      ...updatedFormConfig,
    });
  });

  it("Update `isPublished` on a specific form", async () => {
    const ability = createAbility(getUserPrivileges(PublishForms, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      isPublished: true,
    });

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
        jsonConfig: true,
        isPublished: true,
      },
    });

    expect(updatedTemplate).toEqual({
      id: "formtestID",
      isPublished: true,
      ...formConfiguration,
    });
  });

  it("Update assigned users for template", async () => {
    const ability = createAbility(
      getUserPrivileges(ManageForms.concat(ManageUsers), { user: { id: "1" } })
    );

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      isPublished: true,
    });

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
        jsonConfig: true,
        isPublished: true,
      },
    });
  });

  it("Updates to published forms are not allowed", async () => {
    const ability = createAbility(
      getUserPrivileges(ManageForms.concat(ManageUsers), { user: { id: "1" } })
    );

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
      isPublished: true,
    });

    const updatedFormConfig = structuredClone(
      formConfiguration as unknown as BetterOmit<FormRecord, "id" | "isPublished">
    );

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: updatedFormConfig,
    });

    await expect(async () => {
      await updateTemplate(ability, "test1", updatedFormConfig);
    }).rejects.toThrowError(new TemplateAlreadyPublishedError());
  });

  it.each([[Base], [ManageForms]])("Delete template", async (privileges) => {
    const ability = createAbility(getUserPrivileges(privileges, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

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
          jsonConfig: true,
          isPublished: true,
        },
      })
    );

    expect(deletedTemplate).toEqual({
      id: "formtestID",
      ...formConfiguration,
    });
  });

  it("Only include public properties", async () => {
    const formRecord = {
      id: "testID",
      ...formConfiguration,
      isPublished: false,
    };

    const publicFormRecord = onlyIncludePublicProperties(formRecord as unknown as FormRecord);
    expect(publicFormRecord).not.toHaveProperty("submission");
    expect(publicFormRecord).not.toHaveProperty("internalTitleEn");
    expect(publicFormRecord).not.toHaveProperty("internalTitleFr");
    expect(publicFormRecord).toHaveProperty("securityAttribute");
  });

  it("User with no permission should not be able to use CRUD functions", async () => {
    const ability = createAbility([]);

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    await expect(async () => {
      await createTemplate(
        ability,
        "1",
        formConfiguration as unknown as BetterOmit<FormRecord, "id" | "isPublished">
      );
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await getAllTemplates(ability, "1");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await getFullTemplateByID(ability, "1");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateTemplate(
        ability,
        "test1",
        structuredClone(
          formConfiguration as unknown as BetterOmit<FormRecord, "id" | "isPublished">
        )
      );
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateIsPublishedForTemplate(ability, "formtestID", true);
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await deleteTemplate(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });

  it("User with no relation to the template being interacted with should not be able to use get, update and delete functions", async () => {
    const ability = createAbility(getUserPrivileges(Base, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "2" }],
    });

    await expect(async () => {
      await getFullTemplateByID(ability, "1");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateTemplate(
        ability,
        "test1",
        structuredClone(
          formConfiguration as unknown as BetterOmit<FormRecord, "id" | "isPublished">
        )
      );
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateIsPublishedForTemplate(ability, "formtestID", true);
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await deleteTemplate(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });
});
