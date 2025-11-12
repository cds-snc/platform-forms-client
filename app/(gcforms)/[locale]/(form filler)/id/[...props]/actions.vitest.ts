import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { submitForm } from "./actions";
import { PublicFormRecord, Responses, FormElementTypes } from "@lib/types";

// Mock all the dependencies
vi.mock("@lib/templates", () => ({
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

vi.mock("@lib/notifications", () => ({
  sendNotifications: vi.fn(),
}));

vi.mock("./lib/server/normalizeFormResponses", () => ({
  normalizeFormResponses: vi.fn(),
}));

vi.mock("./lib/server/processFormData", () => ({
  processFormData: vi.fn(),
}));



import { getPublicTemplateByID } from "@lib/templates";
import { verifyHCaptchaToken } from "@lib/validation/hCaptcha";
import { checkOne } from "@lib/cache/flags";
import { dateHasPast } from "@lib/utils";
import { validateVisibleElements, valuesMatchErrorContainsElementType } from "@gcforms/core";
import { serverTranslation } from "@root/i18n";
import { sendNotifications } from "@lib/notifications";
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
    (sendNotifications as Mock).mockResolvedValue(undefined);
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
      fileChecksums: undefined
    });
    expect(sendNotifications).toHaveBeenCalledWith(
      mockFormId,
      mockTemplate.form.titleEn,
      mockTemplate.form.titleFr
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
  });});