import type { MockedFunction } from "vitest";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { prismaMock } from "@testUtils";
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

import { DeliveryOption, FormProperties, FormRecord } from "@lib/types";
import formConfiguration from "@testFixtures/cdsIntakeTestForm.json";

// structuredClone is available starting in Node 17.
// Until we catch up... polyfill
import v8 from "v8";
import { Prisma } from "@gcforms/database";

import { logEvent } from "@lib/auditLogs";
import { deleteDraftFormResponses, unprocessedSubmissions } from "@lib/vault";
import { deleteKey } from "@lib/serviceAccount";
import { AccessControlError } from "@lib/auth/errors";
import {
  mockAuthorizationPass,
  mockAuthorizationFail,
  mockGetAbility,
} from "__utils__/authorization";

vi.mock("@lib/auditLogs", async () => {
  const __actual0 = await vi.importActual<any>("@lib/auditLogs");
  return {
    __esModule: true,
    logEvent: vi.fn(),
    AuditLogDetails: __actual0.AuditLogDetails,
    AuditLogEvent: __actual0.AuditLogEvent,
    AuditLogAccessDeniedDetails: __actual0.AuditLogAccessDeniedDetails,
  };
});

vi.mock("@lib/serviceAccount");
vi.mock("@lib/privileges");

const mockedDeleteKey = vi.mocked(deleteKey);

const structuredClone = <T>(obj: T): T => {
  return v8.deserialize(v8.serialize(obj));
};

const mockedLogEvent = vi.mocked(logEvent);

vi.mock("@lib/vault");

const mockUnprocessedSubmissions = vi.mocked(unprocessedSubmissions);
const mockDeleteDraftFormResponses = vi.mocked(deleteDraftFormResponses);

/*
 * PurposeOption is used to determine the purpose of the form
 * admin: The form is used to collect personal information
 * nonAdmin: The form is used to collect non-personal information
 */
export const PurposeOption = {
  none: "",
  admin: "admin",
  nonAdmin: "nonAdmin",
} as const;
type PurposeOption = (typeof PurposeOption)[keyof typeof PurposeOption];

const buildPrismaResponse = (
  id: string,
  jsonConfig: object,
  isPublished = false,
  deliveryOption?: DeliveryOption,
  formPurpose?: PurposeOption,
  securityAttribute = "Unclassified"
) => {
  const version = {
    id: `${id}-version-1`,
    versionNumber: 1,
    status: isPublished ? "PUBLISHED" : "DRAFT",
    jsonConfig,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: isPublished ? new Date() : null,
    supersededAt: null,
    createdByUserId: null,
    publishedByUserId: null,
    publishReason: "",
    publishFormType: "",
    publishDesc: "",
  };

  return {
    id,
    created_at: new Date(),
    updated_at: new Date(),
    name: "",
    deliveryOption,
    formPurpose,
    isPublished,
    currentPublishedVersionId: isPublished ? version.id : null,
    currentDraftVersionId: isPublished ? null : version.id,
    currentPublishedVersion: isPublished ? version : null,
    currentDraftVersion: isPublished ? null : version,
    securityAttribute,
    publishReason: "",
    publishFormType: "",
    publishDesc: "",
    saveAndResume: true,
    notificationsInterval: null,
    ttl: null,
    closingDate: null,
    closedDetails: null,
    users: [
      {
        id: "1",
        email: "test@cds-snc.ca",
      },
    ],
  };
};

const userID = "user1";

describe("Template CRUD functions", () => {
  describe("User with permission should be able to use CRUD functions", () => {
    beforeAll(() => {
      mockAuthorizationPass(userID);
      mockGetAbility(userID);
    });

    // Ensure vault submission count mock state does not leak between tests
    beforeEach(() => {
      mockUnprocessedSubmissions.mockReset();
      mockDeleteDraftFormResponses.mockReset();
      // Default to no unprocessed submissions unless a test overrides
      mockUnprocessedSubmissions.mockResolvedValue(false);
      mockDeleteDraftFormResponses.mockResolvedValue({ responsesDeleted: 0 });
      (prismaMock.$transaction as MockedFunction<any>).mockImplementation((transaction: any) => {
        if (Array.isArray(transaction)) {
          return Promise.all(transaction);
        }

        return transaction(prismaMock);
      });
      (prismaMock.templateVersion.create as MockedFunction<any>).mockResolvedValue({
        id: "version-id",
      });
      (prismaMock.templateVersion.update as MockedFunction<any>).mockResolvedValue({});
    });

    it("Create a Template", async () => {
      (prismaMock.template.create as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration)
      );

      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration, false)
      );

      const newTemplate = await createTemplate({
        userID: "1",
        formConfig: formConfiguration as FormProperties,
      });

      expect(prismaMock.template.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            users: {
              connect: { id: "1" },
            },
          },
        })
      );

      expect(prismaMock.templateVersion.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            jsonConfig: formConfiguration,
            status: "DRAFT",
            versionNumber: 1,
          }),
        })
      );

      expect(newTemplate).toEqual(
        expect.objectContaining({
          id: "formtestID",
          form: formConfiguration,
          isPublished: false,
          securityAttribute: "Unclassified",
        })
      );

      expect(mockedLogEvent).toHaveBeenCalledWith(
        userID,
        { id: "formtestID", type: "Form" },
        "CreateForm"
      );
    });

    it("Get multiple Templates", async () => {
      (prismaMock.template.findMany as MockedFunction<any>).mockResolvedValue([
        buildPrismaResponse("formtestID", formConfiguration),
        buildPrismaResponse("formtestID2", formConfiguration),
      ]);

      const templates = await getAllTemplates();

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
        userID,
        { type: "Form" },
        "ReadForm",
        "Accessed Forms: All System Forms"
      );
    });

    it("No templates returned", async () => {
      (prismaMock.template.findMany as MockedFunction<any>).mockResolvedValue([]);

      const template = await getAllTemplates();
      expect(template).toEqual([]);
      expect(mockedLogEvent).toHaveBeenCalledTimes(0);
    });

    it("Get templates linked to the provided user", async () => {
      (prismaMock.template.findMany as MockedFunction<any>).mockResolvedValue([
        buildPrismaResponse("formtestID", formConfiguration),
      ]);

      await getAllTemplatesForUser();

      expect(prismaMock.template.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            users: {
              some: {
                id: userID,
              },
            },
          },
        })
      );
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userID,
        { type: "Form" },
        "ReadForm",
        "Accessed Forms: ${formList}",
        { formList: "formtestID" }
      );
    });

    it("Get a public template", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration, true)
      );

      const template = await getPublicTemplateByID("formTestID");

      expect(prismaMock.template.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "formTestID",
          },
        })
      );

      expect(template).toEqual(
        expect.objectContaining({
          closingDate: undefined,
          id: "formtestID",
          form: formConfiguration,
          isPublished: true,
          securityAttribute: "Unclassified",
        })
      );
      expect(mockedLogEvent).toHaveBeenCalledTimes(0);
    });

    it("Get a full template", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration)
      );

      const template = await getFullTemplateByID("formTestID");

      expect(prismaMock.template.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "formTestID",
            ttl: null,
          },
        })
      );

      expect(template).toEqual(
        expect.objectContaining({
          id: "formtestID",
          form: formConfiguration,
          isPublished: false,
          securityAttribute: "Unclassified",
        })
      );
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userID,
        { type: "Form", id: "formTestID" },
        "ReadForm"
      );
    });

    it("Null returned when Template does not Exist", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue(null);

      const template = await getPublicTemplateByID("asdf");
      expect(template).toBe(null);
      expect(mockedLogEvent).toHaveBeenCalledTimes(0);
    });

    test("Get template by id returns null if item is marked as archived", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration),
        ttl: new Date(),
      });

      const template = await getPublicTemplateByID("formtestID");

      expect(template).toBe(null);
    });

    it("Get templates with associated users", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration)
      );

      await getTemplateWithAssociatedUsers("formtestID");

      expect(prismaMock.template.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "formtestID",
          },
        })
      );
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userID,
        { id: "formtestID", type: "Form" },
        "ReadForm",
        "Retrieved users associated with Form"
      );
    });

    it("Update Template", async () => {
      const updatedFormConfig = structuredClone(formConfiguration as FormProperties);

      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue({
        name: "",
        deliveryOption: undefined,
        securityAttribute: "Unclassified",
        currentDraftVersionId: "test1-version-1",
      });

      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("test1", updatedFormConfig)
      );

      const updatedTemplate = await updateTemplate({
        formID: "test1",
        formConfig: updatedFormConfig,
      });

      expect(prismaMock.templateVersion.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "test1-version-1",
          },
          data: {
            jsonConfig: updatedFormConfig as unknown as Prisma.JsonObject,
          },
        })
      );

      expect(updatedTemplate).toEqual(
        expect.objectContaining({
          id: "test1",
          form: updatedFormConfig,
          isPublished: false,
          securityAttribute: "Unclassified",
        })
      );
      expect(mockedLogEvent).toHaveBeenCalledWith(
        userID,
        { id: "test1", type: "Form" },
        "UpdateForm",
        "UpdatedFormContent"
      );
    });

    it("Update `isPublished` on a specific form", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration),
        users: [{ id: "1" }],
      });

      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration, true)
      );

      const updatedTemplate = await updateIsPublishedForTemplate("formtestID", true, "", "", "");

      expect(prismaMock.template.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "formtestID",
          },
          data: {
            isPublished: true,
            currentPublishedVersionId: "formtestID-version-1",
            currentDraftVersionId: null,
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
        userID,
        { id: "formtestID", type: "Form" },
        "PublishForm"
      );
    });

    it("Re-publishes a draft for an already published form", async () => {
      const originalAppEnv = process.env.APP_ENV;
      process.env.APP_ENV = "production";

      try {
        const publishedVersion = {
          id: "formtestID-version-1",
          versionNumber: 1,
          status: "PUBLISHED",
          jsonConfig: formConfiguration,
          createdAt: new Date(),
          updatedAt: new Date(),
          publishedAt: new Date(),
          supersededAt: null,
          createdByUserId: null,
          publishedByUserId: null,
          publishReason: "",
          publishFormType: "",
          publishDesc: "",
        };
        const draftVersion = {
          ...publishedVersion,
          id: "formtestID-version-2",
          versionNumber: 2,
          status: "DRAFT",
          jsonConfig: { ...formConfiguration, titleEn: "Updated public title" },
          publishedAt: null,
        };
        const templateWithDraft = {
          ...buildPrismaResponse("formtestID", formConfiguration, true),
          currentPublishedVersionId: publishedVersion.id,
          currentDraftVersionId: draftVersion.id,
          currentPublishedVersion: publishedVersion,
          currentDraftVersion: draftVersion,
          users: [{ id: "1" }],
        };
        const republishedTemplate = {
          ...templateWithDraft,
          currentPublishedVersionId: draftVersion.id,
          currentDraftVersionId: null,
          currentPublishedVersion: {
            ...draftVersion,
            status: "PUBLISHED",
            publishedAt: new Date(),
          },
          currentDraftVersion: null,
        };

        (prismaMock.template.findUnique as MockedFunction<any>)
          .mockResolvedValueOnce({
            isPublished: true,
            currentPublishedVersionId: publishedVersion.id,
            currentDraftVersionId: draftVersion.id,
          })
          .mockResolvedValueOnce(templateWithDraft);
        (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(republishedTemplate);

        const updatedTemplate = await updateIsPublishedForTemplate("formtestID", true, "", "", "");

        expect(mockDeleteDraftFormResponses).not.toHaveBeenCalled();
        expect(prismaMock.templateVersion.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: publishedVersion.id },
            data: expect.objectContaining({ status: "SUPERSEDED" }),
          })
        );
        expect(prismaMock.templateVersion.update).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: draftVersion.id },
            data: expect.objectContaining({ status: "PUBLISHED" }),
          })
        );
        expect(updatedTemplate).toEqual(
          expect.objectContaining({
            templateVersionId: draftVersion.id,
            templateVersionNumber: 2,
            templateVersionStatus: "PUBLISHED",
            form: draftVersion.jsonConfig,
          })
        );
      } finally {
        process.env.APP_ENV = originalAppEnv;
      }
    });

    it("Update assigned users for template", async () => {
      // Template has one user assigned to it to start
      (prismaMock.template.findFirst as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration, true),
        users: [{ id: "1" }],
      });
      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration, true)
      );
      (prismaMock.user.findUniqueOrThrow as MockedFunction<any>).mockResolvedValueOnce({
        email: "user2@test.ca",
      });

      // We're just adding an additional user (2)
      const users: { id: string }[] = [{ id: "1" }, { id: "2" }];

      await updateAssignedUsersForTemplate("formTestID", users);

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
        userID,
        { id: "formTestID", type: "Form" },
        "GrantFormAccess",
        "GrantAccess",
        { userList: "user2@test.ca" }
      );

      // Template has three users assigned to it to start
      const templateRecord = {
        ...buildPrismaResponse("formtestID", formConfiguration, true),
        users: [{ id: "2" }, { id: "3" }, { id: "4" }],
      };

      (prismaMock.template.findFirst as MockedFunction<any>).mockResolvedValue(templateRecord);
      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration, true)
      );
      (prismaMock.user.findUniqueOrThrow as MockedFunction<any>)
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

      await updateAssignedUsersForTemplate("formTestID", users2);

      // Connect 1, disconnect 2,4
      expect(prismaMock.template.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "formTestID",
          },
          data: {
            users: {
              connect: [{ id: "1" }],
              disconnect: [{ id: "2" }, { id: "4" }],
            },
          },
        })
      );

      // Log one added
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        2,
        userID,
        { id: "formTestID", type: "Form" },
        "GrantFormAccess",
        "GrantAccess",
        { userList: "user1@test.ca" }
      );

      // Log two removed
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        3,
        userID,
        { id: "formTestID", type: "Form" },
        "RevokeFormAccess",
        "RevokeAccess",
        { userList: "user2@test.ca,user4@test.ca" }
      );
    });
    it("Updates to published forms are not allowed", async () => {
      const updatedFormConfig = structuredClone(formConfiguration as FormProperties);

      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(null);

      await expect(async () => {
        await updateTemplate({
          formID: "test1",
          formConfig: updatedFormConfig,
        });
      }).rejects.toThrow(TemplateAlreadyPublishedError);
      expect(mockedLogEvent).toHaveBeenCalledTimes(0);
    });

    it("Remove DeliveryOption from template", async () => {
      (prismaMock.template.findFirstOrThrow as MockedFunction<any>).mockResolvedValue({
        isPublished: false,
      });

      await removeDeliveryOption("formtestID");

      expect(prismaMock.deliveryOption.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            templateId: "formtestID",
          },
        })
      );

      expect(mockedLogEvent).toHaveBeenCalledWith(
        userID,
        { id: "formtestID", type: "Form" },
        "ChangeDeliveryOption",
        "Delivery Option set to the Vault"
      );
    });

    it("Delete template", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration),
        users: [{ id: "1" }],
      });
      // Added: handle implementation using findFirst
      (prismaMock.template.findFirst as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration),
        users: [{ id: "1" }],
      });
      // New implementation uses findFirstOrThrow to fetch publication status
      (prismaMock.template.findFirstOrThrow as MockedFunction<any>).mockResolvedValue({
        isPublished: false,
      });

      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration)
      );

      mockUnprocessedSubmissions.mockResolvedValueOnce(false);

      const deletedTemplate = await deleteTemplate("formtestID");

      expect(prismaMock.template.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: "formtestID",
          },
          data: {
            ttl: expect.any(Date),
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
        userID,
        { id: "formtestID", type: "Form" },
        "DeleteForm"
      );
      expect(mockedDeleteKey).toHaveBeenCalledTimes(1);
    });

    // Test for published template with unprocessed submissions
    it("Published template with unprocessed submissions cannot be deleted", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration, true),
        users: [{ id: "1" }],
      });
      // Added: handle implementation using findFirst
      (prismaMock.template.findFirst as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration, true),
        users: [{ id: "1" }],
      });
      // New implementation uses findFirstOrThrow to fetch publication status
      (prismaMock.template.findFirstOrThrow as MockedFunction<any>).mockResolvedValue({
        isPublished: true,
      });

      // Should never reach update when blocked
      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration, true)
      );

      mockUnprocessedSubmissions.mockResolvedValueOnce(true);

      await expect(deleteTemplate("formtestID")).rejects.toThrow(TemplateHasUnprocessedSubmissions);

      // Ensure no archival update was attempted
      expect(prismaMock.template.update).not.toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ ttl: expect.any(Date) }),
        })
      );
    });

    it("Draft (unpublished) template with unprocessed submissions can be deleted", async () => {
      (prismaMock.template.findUnique as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration, false),
        users: [{ id: "1" }],
      });

      (prismaMock.template.findFirst as MockedFunction<any>).mockResolvedValue({
        ...buildPrismaResponse("formtestID", formConfiguration, false),
        users: [{ id: "1" }],
      });
      // New implementation uses findFirstOrThrow to fetch publication status
      (prismaMock.template.findFirstOrThrow as MockedFunction<any>).mockResolvedValue({
        isPublished: false,
      });

      (prismaMock.template.update as MockedFunction<any>).mockResolvedValue(
        buildPrismaResponse("formtestID", formConfiguration, false)
      );

      mockUnprocessedSubmissions.mockResolvedValueOnce(true);

      const deletedTemplate = await deleteTemplate("formtestID");

      expect(deletedTemplate).toEqual(
        expect.objectContaining({
          id: "formtestID",
          form: formConfiguration,
          isPublished: false,
        })
      );

      expect(prismaMock.template.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "formtestID" },
          data: { ttl: expect.any(Date) },
        })
      );
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
  });

  describe("User with no permission should not be able to use CRUD functions", () => {
    beforeAll(() => {
      mockAuthorizationFail(userID);
    });
    it("Create a Template", async () => {
      await expect(
        createTemplate({
          userID: "1",
          formConfig: formConfiguration as FormProperties,
        })
      ).rejects.toThrow(AccessControlError);
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        1,
        userID,
        { type: "Form" },
        "AccessDenied",
        "Attempted to create a Form"
      );
    });

    it("Get multiple Templates", async () => {
      const result = await getAllTemplates();
      expect(result).toEqual([]);
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        1,
        userID,
        { type: "Form" },
        "AccessDenied",
        "Attempted to access all System Forms"
      );
    });
    it("Get a template", async () => {
      const result = await getFullTemplateByID("1");
      expect(result).toBe(null);
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        1,
        userID,
        { id: "1", type: "Form" },
        "AccessDenied",
        "Attemped to read form object"
      );
    });

    it("Update a template", async () => {
      await expect(
        updateTemplate({
          formID: "test1",
          formConfig: structuredClone(formConfiguration as FormProperties),
        })
      ).rejects.toThrow(AccessControlError);
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        1,
        userID,
        { id: "test1", type: "Form" },
        "AccessDenied",
        "Attempted to update Form"
      );
    });
    it("Update `isPublished` on a specific form", async () => {
      await expect(updateIsPublishedForTemplate("formtestID", true, "", "", "")).rejects.toThrow(
        AccessControlError
      );
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        1,
        userID,
        { id: "formtestID", type: "Form" },
        "AccessDenied",
        "Attempted to publish form"
      );
    });

    it("Remove DeliveryOption from template", async () => {
      await expect(removeDeliveryOption("formtestID")).rejects.toThrow(AccessControlError);
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        1,
        userID,
        { id: "formtestID", type: "Form" },
        "AccessDenied",
        "Attempted to set Delivery Option to the Vault"
      );
    });

    it("Delete template", async () => {
      await expect(deleteTemplate("formtestID")).rejects.toThrow(AccessControlError);
      expect(mockedLogEvent).toHaveBeenNthCalledWith(
        1,
        userID,
        { id: "formtestID", type: "Form" },
        "AccessDenied",
        "Attempted to delete Form"
      );
    });
  });
});
