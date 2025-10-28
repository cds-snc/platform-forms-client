"use server";

import { promises as fs } from "fs";
import { AuthenticatedAction } from "@lib/actions";
import {
  DeliveryOption,
  FormProperties,
  FormRecord,
  SecurityAttribute,
  FormPurpose,
  ClosedDetails,
} from "@lib/types";
import {
  createTemplate as createDbTemplate,
  removeDeliveryOption,
  updateAssignedUsersForTemplate,
  updateClosedData,
  updateTemplate as updateDbTemplate,
  updateIsPublishedForTemplate,
  updateSecurityAttribute,
  updateFormPurpose,
  updateFormSaveAndResume,
  getFormJSONConfig,
  updateFormJSONConfig,
} from "@lib/templates";
import { serverTranslation } from "@i18n";
import { revalidatePath } from "next/cache";
import { isValidDateString } from "@lib/utils/date/isValidDateString";
import { allowedTemplates, TemplateTypes } from "@lib/utils/form-builder";
import { getFullTemplateByID } from "@lib/templates";
import { isValidEmail } from "@gcforms/core";
import { slugify } from "@lib/client/clientHelpers";
import { sendEmail } from "@lib/integration/notifyConnector";
import { getOrigin } from "@lib/origin";
import { BrandProperties, NotificationsInterval } from "@gcforms/types";

export type CreateOrUpdateTemplateType = {
  id?: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: FormPurpose;
  saveAndResume?: boolean;
  notificationsInterval?: NotificationsInterval;
};

// Public facing functions - they can be used by anyone who finds the associated server action identifer

export const createOrUpdateTemplate = AuthenticatedAction(
  async (
    session,
    {
      id,
      formConfig,
      name,
      deliveryOption,
      securityAttribute,
      formPurpose,
      notificationsInterval,
    }: CreateOrUpdateTemplateType
  ): Promise<{
    formRecord: { id: string; updatedAt: string | undefined } | null;
    error?: string;
  }> => {
    try {
      if (id) {
        return await updateTemplate({
          id,
          formConfig,
          name,
          deliveryOption,
          securityAttribute,
          formPurpose,
        });
      }

      const formRecord = await createDbTemplate({
        userID: session.user.id,
        formConfig: formConfig,
        name: name,
        deliveryOption: deliveryOption,
        securityAttribute: securityAttribute,
        formPurpose: formPurpose,
        notificationsInterval,
      });

      if (!formRecord) {
        throw new Error("Failed to create template");
      }
      // revalidatePath must be at the end of a function.  It leverages the error object to trigger
      // and internal refresh and can have awkward results if used before an error is thrown by a following fn.
      revalidatePath("/[locale]/forms", "page");

      return { formRecord: { id: formRecord.id, updatedAt: formRecord.updatedAt } };
    } catch (_) {
      return { formRecord: null, error: "error" };
    }
  }
);

export const updateTemplate = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      formConfig,
      name,
      deliveryOption,
      securityAttribute,
      formPurpose,
      allowPublishedUpdate,
    }: {
      id: string;
      formConfig: FormProperties;
      name?: string;
      deliveryOption?: DeliveryOption;
      securityAttribute?: SecurityAttribute;
      formPurpose?: FormPurpose;
      allowPublishedUpdate?: boolean;
    }
  ): Promise<{
    formRecord: { id: string; updatedAt: string | undefined } | null;
    error?: string;
  }> => {
    try {
      const formRecord = await updateDbTemplate({
        formID: formID,
        formConfig: formConfig,
        name: name,
        deliveryOption: deliveryOption,
        securityAttribute: securityAttribute,
        formPurpose: formPurpose,
        allowPublishedUpdate,
      });

      if (!formRecord) {
        throw new Error("Failed to update template");
      }

      return { formRecord: { id: formRecord.id, updatedAt: formRecord.updatedAt } };
    } catch (_) {
      return { formRecord: null, error: "error" };
    }
  }
);

export const updateTemplatePublishedStatus = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      isPublished,
      publishReason,
      publishFormType,
      publishDescription,
    }: {
      id: string;
      isPublished: boolean;
      publishReason: string;
      publishFormType: string;
      publishDescription: string;
    }
  ): Promise<{
    formRecord: FormRecord | null;
    error?: string;
  }> => {
    try {
      const response = await updateIsPublishedForTemplate(
        formID,
        isPublished,
        publishReason,
        publishFormType,
        publishDescription
      );
      if (!response) {
        throw new Error(
          `Template API response was null. Request information: { ${formID}, ${isPublished} }`
        );
      }

      revalidatePath("/form-builder/[id]", "layout");

      return { formRecord: response };
    } catch (error) {
      return { formRecord: null, error: (error as Error).message };
    }
  }
);

export const updateTemplateFormPurpose = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      formPurpose,
    }: {
      id: string;
      formPurpose: string;
    }
  ): Promise<{
    formRecord: FormRecord | null;
    error?: string;
  }> => {
    try {
      const response = await updateFormPurpose(formID, formPurpose);
      if (!response) {
        throw new Error(
          `Template API response was null. Request information: { ${formID}, ${formPurpose} }`
        );
      }

      return { formRecord: response };
    } catch (error) {
      return { formRecord: null, error: (error as Error).message };
    }
  }
);

export const updateTemplateFormSaveAndResume = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      saveAndResume,
    }: {
      id: string;
      saveAndResume: boolean;
    }
  ): Promise<{
    formRecord: FormRecord | null;
    error?: string;
  }> => {
    try {
      const response = await updateFormSaveAndResume(formID, saveAndResume);
      if (!response) {
        throw new Error(
          `Template API response was null. Request information: { ${formID}, ${saveAndResume} }`
        );
      }

      return { formRecord: response };
    } catch (error) {
      return { formRecord: null, error: (error as Error).message };
    }
  }
);

export const updateTemplateSecurityAttribute = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      securityAttribute,
    }: {
      id: string;
      securityAttribute: SecurityAttribute;
    }
  ): Promise<{
    formRecord: FormRecord | null;
    error?: string;
  }> => {
    try {
      const response = await updateSecurityAttribute(formID, securityAttribute);
      if (!response) {
        throw new Error(
          `Template API response was null. Request information: { ${formID}, ${securityAttribute} }`
        );
      }

      return { formRecord: response };
    } catch (error) {
      return { formRecord: null, error: (error as Error).message };
    }
  }
);

export const closeForm = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      closingDate,
      closedDetails,
    }: {
      id: string;
      closingDate: string | null;
      closedDetails?: ClosedDetails;
    }
  ): Promise<{
    formID: string;
    closingDate: string | null;
    error?: string;
  }> => {
    try {
      // closingDate: null means the form is open, or will be set to be open
      // closingDate: a current or past date means the form is closed
      // closingDate: a future date means the form is scheduled to close in the future

      if (closingDate && !isValidDateString(closingDate)) {
        throw new Error(`Invalid closing date. Request information: { ${formID}, ${closingDate} }`);
      }

      const response = await updateClosedData(formID, closingDate, closedDetails);
      if (!response) {
        throw new Error(
          `Template API response was null. Request information: { ${formID}, ${closingDate} }`
        );
      }

      return response;
    } catch (error) {
      return { formID: "", closingDate: null, error: (error as Error).message };
    }
  }
);

export const updateTemplateUsers = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
      users,
    }: {
      id: string;
      users: { id: string }[];
    }
  ): Promise<{
    success: boolean;
    error?: string;
  }> => {
    if (!users.length) {
      return { success: false, error: "mustHaveAtLeastOneUser" };
    }

    try {
      const response = await updateAssignedUsersForTemplate(formID, users);
      if (!response) {
        throw new Error(
          `Template API response was null. Request information: { ${formID}, ${users} }`
        );
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
);

export const sendResponsesToVault = AuthenticatedAction(
  async (
    _,
    {
      id: formID,
    }: {
      id: string;
    }
  ): Promise<{
    success?: boolean;
    error?: string;
  }> => {
    try {
      await removeDeliveryOption(formID);

      return {
        success: true,
      };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
);

export const getTranslatedElementProperties = async (type: string) => {
  const { t: en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: fr } = await serverTranslation("form-builder", { lang: "fr" });
  return {
    description: {
      en: en([`defaultElementDescription.${type}`, ""]),
      fr: fr([`defaultElementDescription.${type}`, ""]),
    },
    label: {
      en: en([`defaultElementLabel.${type}`, ""]),
      fr: fr([`defaultElementLabel.${type}`, ""]),
    },
  };
};

export const getTranslatedProperties = async (type: string) => {
  const { t: en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: fr } = await serverTranslation("form-builder", { lang: "fr" });
  return {
    en: en(type),
    fr: fr(type),
  };
};

export const getTranslatedDynamicRowProperties = async () => {
  const { t: en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: fr } = await serverTranslation("form-builder", { lang: "fr" });

  return {
    rowTitleEn: en("dynamicRow.defaultRowTitle"),
    rowTitleFr: fr("dynamicRow.defaultRowTitle"),
    addButtonTextEn: en("dynamicRow.defaultAddButtonText"),
    removeButtonTextEn: en("dynamicRow.defaultRemoveButtonText"),
    addButtonTextFr: fr("dynamicRow.defaultAddButtonText"),
    removeButtonTextFr: fr("dynamicRow.defaultRemoveButtonText"),
  };
};

export const loadBlockTemplate = async ({
  type,
}: {
  type: TemplateTypes;
}): Promise<{
  data?: [];
  error?: string;
}> => {
  try {
    if (!allowedTemplates.includes(type)) {
      throw new Error("Invalid template type");
    }
    const dir = "public/static/templates";
    const fileContents = await fs.readFile(dir + `/${type}.json`, "utf8");
    return { data: JSON.parse(fileContents) };
  } catch (error) {
    return { data: [], error: (error as Error).message };
  }
};

export const shareForm = AuthenticatedAction(
  async (
    session,
    {
      formId,
      emails,
      filename,
    }: {
      formId: string;
      emails: string[];
      filename: string;
    }
  ): Promise<{
    success?: boolean;
    error?: string;
  }> => {
    try {
      if (!emails || emails.length < 1 || !formId || !filename) {
        throw new Error("Malformed request");
      }

      const template = await getFullTemplateByID(formId);

      if (!template || !template.form) {
        throw new Error("Form not found");
      }

      const base64data = Buffer.from(JSON.stringify(template.form)).toString("base64");

      // Ensure valid email addresses
      const cleanedEmails = emails.filter((email) => isValidEmail(email));

      if (cleanedEmails.length < 1) {
        throw new Error("Invalid email addresses");
      }

      let cleanedFilename = slugify(filename);

      // Shorten file name to 50 characters
      if (cleanedFilename.length > 50) {
        cleanedFilename = cleanedFilename.substring(0, 50);
      }

      const HOST = await getOrigin();

      // Here is the documentation for the `sendEmail` function: https://docs.notifications.service.gov.uk/node.html#send-an-email
      await Promise.all(
        emails.map((email: string) => {
          return sendEmail(
            email,
            {
              application_file: {
                file: base64data,
                filename: `${cleanedFilename}.json`,
                sending_method: "attach",
              },
              subject: "Form shared | Formulaire partagé",
              formResponse: `
**${session.user.name} (${session.user.email}) has shared a form with you.**

To preview this form:
- **Step 1**:
  Save the attached JSON form file to your computer.
- **Step 2**:
  Go to [GC Forms](${HOST}). No account needed.
- **Step 3**:
  Select open a form file.

****

**${session.user.name} (${session.user.email}) a partagé un formulaire avec vous.**

Pour prévisualiser ce formulaire :
- **Étape 1 :**
  Enregistrer le fichier de formulaire JSON ci-joint sur votre ordinateur.
- **Étape 2 :**
  Aller sur [Formulaires GC](${HOST}). Aucun compte n'est nécessaire.
- **Étape 3 :**
  Sélectionner "Ouvrir un formulaire".`,
            },
            "shareForm"
          );
        })
      );

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
);

export const updateBranding = AuthenticatedAction(
  async (
    _,
    {
      id: formId,
      branding,
    }: {
      id: string;
      branding: BrandProperties | undefined;
    }
  ): Promise<{
    formRecord: { id: string; updatedAt: string | undefined } | null;
    error?: string;
  }> => {
    try {
      const formConfig = await getFormJSONConfig(formId);

      if (!formConfig) {
        throw new Error("Failed to get template for branding update");
      }

      const updatedFormConfig: FormProperties = {
        ...formConfig,
        brand: branding,
      };
      const formRecord = await updateFormJSONConfig(formId, updatedFormConfig);

      if (!formRecord) {
        throw new Error("Failed to update template");
      }

      return { formRecord: { id: formRecord.id, updatedAt: formRecord.updatedAt } };
    } catch (_) {
      return { formRecord: null, error: "error" };
    }
  }
);
