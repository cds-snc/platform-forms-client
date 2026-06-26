import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { NotificationsInterval } from "@gcforms/types";
import { submitForm } from "./actions";
import { PublicFormRecord, Responses, FormElementTypes } from "@lib/types";

// Mock all the dependencies
vi.mock("@lib/templates/queries/getPublicTemplateByID", () => ({
  getPublicTemplateByID: vi.fn(),
}));

vi.mock("@lib/validation/hCaptcha", () => ({
  verifyHCaptchaToken: vi.fn(),
}));

vi.mock("@lib/cache/flags", () => ({
  checkOne: vi.fn(),
}));

vi.mock("@lib/utils", () => ({
  dateHasPast: vi.fn(),
}));

vi.mock("@gcforms/core", async () => {
  const actual = await vi.importActual("@gcforms/core");
  return {
    ...actual,
    validateVisibleElements: vi.fn(),
    valuesMatchErrorContainsElementType: vi.fn(),
  };
});

vi.mock("@root/i18n", () => ({
  serverTranslation: vi.fn(),
}));

vi.mock("@lib/formEmailOrchestration", () => ({
  getFormNotificationInterval: vi.fn(),
  updateNotificationMarker: vi.fn(),
  prepareFormSubmissionEmail: vi.fn(),
}));

vi.mock("@lib/integration/notifyConnector", () => ({
  sendEmail: vi.fn(),
}));

vi.mock("./lib/server/normalizeFormResponses", () => ({
  normalizeFormResponses: vi.fn(),
}));

vi.mock("./lib/server/processFormData", () => ({
  processFormData: vi.fn(),
}));



import { getPublicTemplateByID } from "@lib/templates/queries/getPublicTemplateByID";
import { verifyHCaptchaToken } from "@lib/validation/hCaptcha";
import { checkOne } from "@lib/cache/flags";
import { dateHasPast } from "@lib/utils";
import { validateVisibleElements, valuesMatchErrorContainsElementType } from "@gcforms/core";
import { serverTranslation } from "@root/i18n";
import { getFormNotificationInterval, prepareFormSubmissionEmail, updateNotificationMarker } from "@lib/formEmailOrchestration";
import { sendEmail } from "@lib/integration/notifyConnector";
import { normalizeFormResponses } from "./lib/server/normalizeFormResponses";
import { processFormData } from "./lib/server/processFormData";

describe("submitForm", () => {
  const mockFormId = "test-form-id";
  const mockLanguage = "en";
  const mockValues: Responses = {
    "1": "test value",
    "2": "another value",
  };

  const mockTemplate: PublicFormRecord = {
    id: mockFormId,
    isPublished: true,
    closingDate: undefined,
    securityAttribute: "Unclassified",
    form: {
      titleEn: "Test Form",
      titleFr: "Formulaire Test",
      layout: [],
      elements: [],
    },
  } as PublicFormRecord;

  beforeEach(() => {
    vi.clearAllMocks();

    // Default successful mocks
    (getPublicTemplateByID as Mock).mockResolvedValue(mockTemplate);
    (checkOne as Mock).mockResolvedValue(false);
    (verifyHCaptchaToken as Mock).mockResolvedValue(true);
    (dateHasPast as Mock).mockReturnValue(false);
    (serverTranslation as Mock).mockResolvedValue({ t: vi.fn() });
    (validateVisibleElements as Mock).mockReturnValue({ errors: {} });
    (valuesMatchErrorContainsElementType as Mock).mockReturnValue(false);
    (normalizeFormResponses as Mock).mockReturnValue(mockValues);
    (processFormData as Mock).mockResolvedValue({
      submissionId: "test-submission-id",
      fileURLMap: {}
    });
    (getFormNotificationInterval as Mock).mockResolvedValue(false);
    (updateNotificationMarker as Mock).mockResolvedValue(null);
    (prepareFormSubmissionEmail as Mock).mockResolvedValue(null);
    (sendEmail as Mock).mockResolvedValue(undefined);
  });

  it("should return MissingFormDataError when file input validation fails", async () => {
    // Mock validation to return file input errors
    (validateVisibleElements as Mock).mockReturnValue({
      errors: {},
      valueMatchErrors: {
        "file-input-1": ["File validation error"]
      }
    });
    (valuesMatchErrorContainsElementType as Mock).mockReturnValue(true);

    const result = await submitForm(mockValues, mockLanguage, mockFormId);

    expect(result).toEqual({
      id: mockFormId,
      error: {
        name: "MissingFormDataError",
        message: "Form data validation failed due to file input errors"
      }
    });

    // Verify that valuesMatchErrorContainsElementType was called with correct parameters
    expect(valuesMatchErrorContainsElementType).toHaveBeenCalledWith(
      { "file-input-1": ["File validation error"] },
      "fileInput"
    );
  });

  it("should successfully submit form and return submission details", async () => {
    const result = await submitForm(mockValues, mockLanguage, mockFormId);

    expect(result).toEqual({
      id: mockFormId,
      submissionId: "test-submission-id",
      fileURLMap: {}
    });

    // Verify function calls
    expect(getPublicTemplateByID).toHaveBeenCalledWith(mockFormId);
    expect(validateVisibleElements).toHaveBeenCalledWith(mockValues, {
      formRecord: mockTemplate,
      t: expect.any(Function)
    });
    expect(normalizeFormResponses).toHaveBeenCalledWith(mockTemplate, mockValues);
    expect(processFormData).toHaveBeenCalledWith({
      responses: mockValues,
      securityAttribute: mockTemplate.securityAttribute,
      formId: mockFormId,
      language: mockLanguage,
      fileChecksums: undefined,
      notificationId: undefined,
    });
    expect(getFormNotificationInterval).toHaveBeenCalledWith(mockFormId);
    expect(prepareFormSubmissionEmail).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("should send a first submission notification when form is eligible and no prior marker exists", async () => {
    const mockEmailData = {
      emails: ["user@example.com"],
      subject: "You have a new submission",
      formResponse: "Email body",
    };
    (checkOne as Mock).mockResolvedValue(true);
    (getFormNotificationInterval as Mock).mockResolvedValue(NotificationsInterval.DAY);
    (updateNotificationMarker as Mock).mockResolvedValue("FIRST_EMAIL");
    (prepareFormSubmissionEmail as Mock).mockResolvedValue(mockEmailData);

    const result = await submitForm(mockValues, mockLanguage, mockFormId);

    expect(result).toEqual({
      id: mockFormId,
      submissionId: "test-submission-id",
      fileURLMap: {}
    });

    expect(updateNotificationMarker).toHaveBeenCalledWith(mockFormId, NotificationsInterval.DAY);

    expect(prepareFormSubmissionEmail).toHaveBeenCalledWith(
      mockFormId,
      mockTemplate.form.titleEn,
      mockTemplate.form.titleFr,
      "FIRST_EMAIL"
    );

    const notificationId = (processFormData as Mock).mock.calls[0][0].notificationId;
    expect(notificationId).toBeTypeOf("string");

    expect(sendEmail).toHaveBeenCalledWith(
      mockEmailData.emails,
      { subject: mockEmailData.subject, formResponse: mockEmailData.formResponse },
      "formSubmissionNotification",
      { mode: "deferred", notificationId }
    );
    expect(processFormData).toHaveBeenCalledWith(
      expect.objectContaining({ notificationId })
    );
  });

  it("should send a second submission notification when form is eligible and first marker already set", async () => {
    const mockEmailData = {
      emails: ["user@example.com"],
      subject: "You have multiple new submissions",
      formResponse: "Email body",
    };
    (checkOne as Mock).mockResolvedValue(true);
    (getFormNotificationInterval as Mock).mockResolvedValue(NotificationsInterval.DAY);
    (updateNotificationMarker as Mock).mockResolvedValue("SECOND_EMAIL");
    (prepareFormSubmissionEmail as Mock).mockResolvedValue(mockEmailData);

    const result = await submitForm(mockValues, mockLanguage, mockFormId);

    expect(result).toEqual({
      id: mockFormId,
      submissionId: "test-submission-id",
      fileURLMap: {}
    });

    expect(updateNotificationMarker).toHaveBeenCalledWith(mockFormId, NotificationsInterval.DAY);

    expect(prepareFormSubmissionEmail).toHaveBeenCalledWith(
      mockFormId,
      mockTemplate.form.titleEn,
      mockTemplate.form.titleFr,
      "SECOND_EMAIL"
    );

    const notificationId = (processFormData as Mock).mock.calls[0][0].notificationId;
    expect(notificationId).toBeTypeOf("string");

    expect(sendEmail).toHaveBeenCalledWith(
      mockEmailData.emails,
      { subject: mockEmailData.subject, formResponse: mockEmailData.formResponse },
      "formSubmissionNotification",
      { mode: "deferred", notificationId }
    );
    expect(processFormData).toHaveBeenCalledWith(
      expect.objectContaining({ notificationId })
    );
  });

  it("should not send a notification when form is eligible but marker limit is reached", async () => {
    (checkOne as Mock).mockResolvedValue(true);
    (getFormNotificationInterval as Mock).mockResolvedValue(NotificationsInterval.DAY);
    (updateNotificationMarker as Mock).mockResolvedValue(null);

    await submitForm(mockValues, mockLanguage, mockFormId);

    expect(updateNotificationMarker).toHaveBeenCalledWith(mockFormId, NotificationsInterval.DAY);
    expect(prepareFormSubmissionEmail).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
    expect(processFormData).toHaveBeenCalledWith(
      expect.objectContaining({ notificationId: undefined })
    );
  });

  it("should return MissingFormDataError when submitting .exe file using real validation", async () => {
    // This test uses REAL validation functions (not mocked) to verify that
    // a .exe file is properly rejected by the validation logic

    // Import the actual validation functions
    const actualCore = await vi.importActual("@gcforms/core") as {
      validateVisibleElements: typeof validateVisibleElements;
      valuesMatchErrorContainsElementType: typeof valuesMatchErrorContainsElementType;
    };

    // Create a form template with a file input element that only allows pdf,doc,docx
    const templateWithFileInput: PublicFormRecord = {
      ...mockTemplate,
      form: {
        ...mockTemplate.form,
        elements: [
          {
            id: 1,
            type: FormElementTypes.fileInput,
            properties: {
              titleEn: "Upload a file",
              titleFr: "Télécharger un fichier",
              fileType: "pdf,doc,docx", // Only allow specific file types - .exe should be rejected
            },
          },
        ],
      },
    };

    // Mock form values with a .exe file (which should be invalid based on fileType restriction)
    const valuesWithExeFile: Responses = {
      "1": {
        name: "malware.exe", // This .exe extension should be rejected by real validation
        size: 5000,
        id: "test-file-id",
      },
    };

    // Override template mock for this test
    (getPublicTemplateByID as Mock).mockResolvedValue(templateWithFileInput);

    // Use real validation functions for this test instead of mocks
    (validateVisibleElements as Mock).mockImplementation(actualCore.validateVisibleElements);
    (valuesMatchErrorContainsElementType as Mock).mockImplementation(actualCore.valuesMatchErrorContainsElementType);

    // Mock the translation function with a real implementation
    (serverTranslation as Mock).mockResolvedValue({
      t: (key: string) => key // Simple passthrough translation
    });

    const result = await submitForm(valuesWithExeFile, mockLanguage, mockFormId);

    // The real validation should detect the .exe file as invalid and trigger the error
    expect(result).toEqual({
      id: mockFormId,
      error: {
        name: "MissingFormDataError",
        message: "Form data validation failed due to file input errors"
      }
    });

    // Verify that the template was fetched
    expect(getPublicTemplateByID).toHaveBeenCalledWith(mockFormId);

    // Verify that real validation was called with our form data
    expect(validateVisibleElements).toHaveBeenCalledWith(valuesWithExeFile, {
      formRecord: templateWithFileInput,
      t: expect.any(Function)
    });
  });

  it("should fall back to GC Notify (sendEmail without deferred mode) and return undefined notificationId when the notification flag is off", async () => {
    const mockEmailData = {
      emails: ["user@example.com"],
      subject: "You have a new submission",
      formResponse: "Email body",
    };
    // Flag OFF
    (checkOne as Mock).mockResolvedValue(false);
    (getFormNotificationInterval as Mock).mockResolvedValue(NotificationsInterval.DAY);
    (updateNotificationMarker as Mock).mockResolvedValue("FIRST_EMAIL");
    (prepareFormSubmissionEmail as Mock).mockResolvedValue(mockEmailData);

    const result = await submitForm(mockValues, mockLanguage, mockFormId);

    expect(result).toEqual({
      id: mockFormId,
      submissionId: "test-submission-id",
      fileURLMap: {},
    });

    // sendEmail is called without deferred mode — falls back to GC Notify
    expect(sendEmail).toHaveBeenCalledWith(
      mockEmailData.emails,
      { subject: mockEmailData.subject, formResponse: mockEmailData.formResponse },
      "formSubmissionNotification"
    );

    // No notificationId is generated or forwarded to processFormData when the flag is off
    expect(processFormData).toHaveBeenCalledWith(
      expect.objectContaining({ notificationId: undefined })
    );
  });
});