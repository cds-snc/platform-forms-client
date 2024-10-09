import { FormRecord } from "@lib/types";
import { merge } from "lodash";

interface User {
  id: string;
  name: string | null;
  email: string;
}

interface TemplateWithUsers {
  formRecord: FormRecord;
  users: User[];
}

export const mockTemplateWithUsers = (
  overrides: Partial<TemplateWithUsers> = {}
): TemplateWithUsers => {
  const templateWithUsers = {
    formRecord: {
      id: "form-id",
      name: "form-name",
      form: {
        titleEn: "form-name",
        titleFr: "form-name",
        id: "form-id",
        layout: [],
        elements: [],
      },
      isPublished: false,
      securityAttribute: "Unclassified",
    },
    users: [
      {
        id: "1",
        name: "test",
        email: "test@cds-snc.ca",
      },
    ],
  };

  return merge(templateWithUsers, overrides);
};
