import { FormRecord } from "@lib/types";

export const mockFormRecord = (overrides: Partial<FormRecord> = {}): FormRecord => {
  const defaultTemplate: FormRecord = {
    id: "template-id",
    name: "template-name",
    securityAttribute: "Unclassified",
    closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toString(),
    created_at: new Date().toString(),
    updated_at: new Date().toString(),
    jsonConfig: "{}",
    isPublished: false,
    formPurpose: "form-purpose",
    publishReason: "publish-reason",
    publishFormType: "publish-form-type",
    publishDesc: "publish-desc",
    bearerToken: "",
    ttl: new Date().toString(),
    closedDetails: {
      messageEn: "closed-message-en",
      messageFr: "closed-message-fr",
    },
    form: {
      titleEn: "",
      titleFr: "",
      layout: [],
      elements: [],
    },
  };

  return { ...defaultTemplate, ...overrides };
};
