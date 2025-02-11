interface User {
  id: string;
  name: string | null;
  email: string;
}

interface Template {
  id: string;
  name: string;
  securityAttribute: string;
  users?: User[];
  closingDate: Date;
  created_at: Date;
  updated_at: Date;
  jsonConfig: string;
  isPublished: boolean;
  formPurpose: string;
  publishReason: string;
  publishFormType: string;
  publishDesc: string;
  bearerToken: string;
  ttl: Date;
  closedDetails: string;
  saveAndResume: boolean;
}

export const mockTemplate = (overrides: Partial<Template> = {}): Template => {
  const defaultTemplate: Template = {
    id: "template-id",
    users: [{ id: "user-id", email: "test@cds-snc.ca", name: "test user" }],
    name: "template-name",
    securityAttribute: "Unclassified",
    closingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    created_at: new Date(),
    updated_at: new Date(),
    jsonConfig: "{}",
    isPublished: false,
    formPurpose: "form-purpose",
    publishReason: "publish-reason",
    publishFormType: "publish-form-type",
    publishDesc: "publish-desc",
    bearerToken: "",
    ttl: new Date(),
    closedDetails: "",
    saveAndResume: false,
  };

  return { ...defaultTemplate, ...overrides };
};
