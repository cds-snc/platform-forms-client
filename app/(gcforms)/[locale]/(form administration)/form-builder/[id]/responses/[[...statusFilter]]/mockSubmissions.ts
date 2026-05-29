import { FormElement, FormElementTypes, FormProperties, Responses, VaultStatus } from "@lib/types";
import type { VaultSubmission, VaultSubmissionOverview } from "@lib/types";

const MOCK_RESPONSE_NAMES = ["26-05-mock1", "26-05-mock2", "26-05-mock3"];
const MOCK_CREATED_AT = Date.UTC(2026, 4, 29, 12, 0, 0);

export const mockResponseSubmissionsEnabled = () =>
  process.env.NODE_ENV === "development" && process.env.MOCK_SUBMISSION_RESULTS === "true";

export const getMockSubmissionOverviews = (
  formID: string,
  status: VaultStatus
): VaultSubmissionOverview[] => {
  return MOCK_RESPONSE_NAMES.map((name, index) => ({
    formID,
    name,
    status,
    createdAt: MOCK_CREATED_AT - index * 60_000,
  }));
};

export const getMockVaultSubmissions = ({
  formID,
  ids,
  form,
}: {
  formID: string;
  ids: string[];
  form: FormProperties;
}): VaultSubmission[] => {
  const requestedIds = ids.length ? ids : MOCK_RESPONSE_NAMES;

  return requestedIds.map((name, index) => ({
    formID,
    submissionID: `mock-submission-${index + 1}`,
    formSubmission: getMockFormSubmission(form) as Responses,
    securityAttribute: "Protected A",
    createdAt: MOCK_CREATED_AT - index * 60_000,
    status: VaultStatus.NEW,
    confirmationCode: `mock-confirmation-${index + 1}`,
    name,
    lastDownloadedBy: "",
  }));
};

const getMockFormSubmission = (form: FormProperties): Record<string, unknown> => {
  const responses = form.elements.reduce<Record<string, unknown>>((accumulator, element, index) => {
    if (element.type === FormElementTypes.richText) {
      return accumulator;
    }

    accumulator[String(element.id)] = getMockAnswer(element, index);
    return accumulator;
  }, {});

  if (Object.keys(responses).length === 0) {
    responses["1"] = "Mock response";
  }

  return responses;
};

const getMockAnswer = (element: FormElement, index: number): unknown => {
  switch (element.type) {
    case FormElementTypes.checkbox:
      return [element.properties.choices?.[0]?.en ?? "Mock option"];
    case FormElementTypes.radio:
    case FormElementTypes.dropdown:
      return element.properties.choices?.[0]?.en ?? "Mock option";
    case FormElementTypes.fileInput:
      return { id: `mock-file-${index + 1}`, name: `mock-file-${index + 1}.txt` };
    case FormElementTypes.formattedDate:
      return { YYYY: "2026", MM: "05", DD: "29" };
    case FormElementTypes.addressComplete:
      return JSON.stringify({
        streetAddress: "123 Mock Street",
        city: "Ottawa",
        province: "ON",
        postalCode: "A1A 1A1",
        country: "CAN",
      });
    default:
      return `Mock answer ${index + 1}`;
  }
};
