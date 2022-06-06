import { prismaMock } from "@jestUtils";
import {
  createTemplate,
  getAllTemplates,
  getTemplateByID,
  updateTemplate,
  deleteTemplate,
  getTemplateByStatus,
  getSubmissionTypeByID,
  onlyIncludePublicProperties,
} from "../templates";
import { FormConfiguration, FormRecord } from "@lib/types/form-types";
import formConfiguration from "@jestFixtures/cdsIntakeTestForm.json";

// structuredClone is available starting in Node 17.
// Until we catch up... polyfill
import v8 from "v8";
import { Prisma } from "@prisma/client";

const structuredClone = <T>(obj: T): T => {
  return v8.deserialize(v8.serialize(obj));
};

describe("Template CRUD functions", () => {
  test("Create a Template", async () => {
    (prismaMock.template.create as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    const newTemplate = await createTemplate(formConfiguration as FormConfiguration);

    expect(
      prismaMock.template.create.calledWith({
        data: {
          jsonConfig: formConfiguration,
        },
      })
    );
    expect(newTemplate).toEqual({
      formID: "formtestID",
      formConfig: formConfiguration,
    });
  });
  test("Get a single Template", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    const template = await getTemplateByID("formTestID");
    expect(
      prismaMock.template.findUnique.calledWith({
        where: {
          id: "formTestID",
        },
        select: {
          id: true,
          jsonConfig: true,
        },
      })
    );

    expect(template).toEqual({
      formID: "formtestID",
      formConfig: formConfiguration,
    });
  });
  test("Null returned when Template does not Exist", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue(null);

    const template = await getTemplateByID("asdf");
    expect(template).toBe(null);
  });
  test("Get multiple Templates", async () => {
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

    const templates = await getAllTemplates();
    expect(templates).toEqual([
      {
        formID: "formtestID",
        formConfig: formConfiguration,
      },
      {
        formID: "formtestID2",
        formConfig: formConfiguration,
      },
    ]);
  });
  test("No templates returned", async () => {
    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([]);

    const template = await getAllTemplates();
    expect(template).toEqual([]);
  });
  test("Update Template", async () => {
    const updatedFormConfig = structuredClone(formConfiguration as FormConfiguration);
    updatedFormConfig.publishingStatus = true;
    (prismaMock.template.update as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: updatedFormConfig,
    });

    const updatedTemplate = await updateTemplate("test1", updatedFormConfig);

    expect(
      prismaMock.template.update.calledWith({
        where: {
          id: "formtestID",
        },
        data: {
          jsonConfig: updatedFormConfig as unknown as Prisma.JsonObject,
        },
        select: {
          id: true,
          jsonConfig: true,
        },
      })
    );

    expect(updatedTemplate).toEqual({
      formID: "formtestID",
      formConfig: updatedFormConfig,
    });
  });
  test("Delete template", async () => {
    (prismaMock.template.delete as jest.MockedFunction<any>).mockResolvedValue({
      id: "formtestID",
      jsonConfig: formConfiguration,
    });

    const deletedTemplate = await deleteTemplate("formtestID");
    expect(
      prismaMock.template.delete.calledWith({
        where: {
          id: "formtestID",
        },
      })
    );
    expect(deletedTemplate).toEqual({
      formID: "formtestID",
      formConfig: formConfiguration,
    });
  });
  test("Get Templates by publishing status", async () => {
    const updatedFormConfig = structuredClone(formConfiguration as FormConfiguration);
    updatedFormConfig.publishingStatus = true;
    (prismaMock.template.findMany as jest.MockedFunction<any>).mockResolvedValue([
      {
        id: "formtestID",
        jsonConfig: formConfiguration,
      },
      {
        id: "formtestID2",
        jsonConfig: updatedFormConfig,
      },
    ]);

    const publishedTemplates = await getTemplateByStatus(true);
    expect(publishedTemplates).toHaveLength(1);
    expect(publishedTemplates).toMatchObject([
      {
        formID: "formtestID2",
        formConfig: {
          publishingStatus: true,
          displayAlphaBanner: true,
          securityAttribute: "Unclassified",
          form: updatedFormConfig.form,
        },
      },
    ]);
  });
  test("Get Submission Type", async () => {
    (prismaMock.template.findUnique as jest.MockedFunction<any>).mockResolvedValue({
      jsonConfig: formConfiguration,
    });

    const submissionType = await getSubmissionTypeByID("formtestID");
    expect(
      prismaMock.template.findUnique.calledWith({
        where: {
          id: "formtestID",
        },
        select: {
          jsonConfig: true,
        },
      })
    );

    expect(submissionType).toEqual(formConfiguration.submission);
  });
  test("Only include public properties", async () => {
    const formRecord = {
      formID: "testID",
      formConfig: formConfiguration,
    };

    const publicFormRecord = onlyIncludePublicProperties(formRecord as FormRecord);
    expect(publicFormRecord).not.toHaveProperty("submission");
    expect(publicFormRecord).not.toHaveProperty("internalTitleEn");
    expect(publicFormRecord).not.toHaveProperty("internalTitleFr");
  });
});
