/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * @jest-environment node
 */

import Redis from "ioredis-mock";
import { prismaMock } from "@jestUtils";
import {
  createTemplate,
  getAllTemplates,
  getTemplateByID,
  updateTemplate,
  deleteTemplate,
  getTemplateSubmissionTypeByID,
  onlyIncludePublicProperties,
} from "../templates";

import { BetterOmit, FormRecord } from "@lib/types";
import formConfiguration from "@jestFixtures/cdsIntakeTestForm.json";

// structuredClone is available starting in Node 17.
// Until we catch up... polyfill
import v8 from "v8";
import { Prisma } from "@prisma/client";
import { AccessControlError, createAbility } from "@lib/privileges";
import { Base, getUserPrivileges, ManageForms } from "__utils__/permissions";

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
      formConfiguration as BetterOmit<FormRecord, "id" | "bearerToken">
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
      where: {},
      select: {
        id: true,
        jsonConfig: true,
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
        users: {
          some: {
            id: "1",
          },
        },
      },
      select: {
        id: true,
        jsonConfig: true,
      },
    });
  });

  it("Get a single Template", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    const template = await getTemplateByID("formTestID");

    expect(prismaMock.template.findUnique).toHaveBeenCalledWith({
      where: {
        id: "formTestID",
      },
      select: {
        id: true,
        jsonConfig: true,
      },
    });

    expect(template).toEqual({
      id: "formtestID",
      ...formConfiguration,
    });
  });

  it("Null returned when Template does not Exist", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

    const template = await getTemplateByID("asdf");
    expect(template).toBe(null);
  });

  it("Get Submission Type", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      jsonConfig: formConfiguration,
    });

    const submissionType = await getTemplateSubmissionTypeByID("formtestID");

    expect(submissionType).toEqual(formConfiguration.submission);
  });

  it.each([[Base], [ManageForms]])("Update Template", async (privileges) => {
    const ability = createAbility(getUserPrivileges(privileges, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    const updatedFormConfig = structuredClone(
      formConfiguration as BetterOmit<FormRecord, "id" | "bearerToken">
    );
    updatedFormConfig.publishingStatus = true;

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
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
      },
    });

    expect(updatedTemplate).toEqual({
      id: "formtestID",
      ...updatedFormConfig,
    });
  });

  it.each([[Base], [ManageForms]])("Delete template", async (privileges) => {
    const ability = createAbility(getUserPrivileges(privileges, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "1" }],
    });

    (prismaMock.template.delete as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    const deletedTemplate = await deleteTemplate(ability, "formtestID");

    expect(prismaMock.template.delete).toHaveBeenCalledWith({
      where: {
        id: "formtestID",
      },
      select: {
        id: true,
        jsonConfig: true,
      },
    });

    expect(deletedTemplate).toEqual({
      id: "formtestID",
      ...formConfiguration,
    });
  });

  it("Only include public properties", async () => {
    const formRecord = {
      id: "testID",
      ...formConfiguration,
    };

    const publicFormRecord = onlyIncludePublicProperties(formRecord as FormRecord);
    expect(publicFormRecord).not.toHaveProperty("submission");
    expect(publicFormRecord).not.toHaveProperty("internalTitleEn");
    expect(publicFormRecord).not.toHaveProperty("internalTitleFr");
    expect(publicFormRecord).toHaveProperty("displayAlphaBanner");
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
        formConfiguration as BetterOmit<FormRecord, "id" | "bearerToken">
      );
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await getAllTemplates(ability, "1");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await updateTemplate(
        ability,
        "test1",
        structuredClone(formConfiguration as BetterOmit<FormRecord, "id" | "bearerToken">)
      );
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await deleteTemplate(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });

  it("User with no relation to the template being interacted with should not be able to use update and delete functions", async () => {
    const ability = createAbility(getUserPrivileges(Base, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
      users: [{ id: "2" }],
    });

    await expect(async () => {
      await updateTemplate(
        ability,
        "test1",
        structuredClone(formConfiguration as BetterOmit<FormRecord, "id" | "bearerToken">)
      );
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));

    await expect(async () => {
      await deleteTemplate(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });

  it("User with Base permissions should not be able to delete a template that is published", async () => {
    const ability = createAbility(getUserPrivileges(Base, { user: { id: "1" } }));

    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: { ...formConfiguration, publishingStatus: true },
      users: [{ id: "1" }],
    });

    await expect(async () => {
      await deleteTemplate(ability, "formtestID");
    }).rejects.toThrowError(new AccessControlError(`Access Control Forbidden Action`));
  });
});
