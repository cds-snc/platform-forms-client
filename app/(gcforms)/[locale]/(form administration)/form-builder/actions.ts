"use server";

import { authCheckAndThrow } from "@lib/actions";
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
  deleteTemplate as deleteDbTemplate,
  updateSecurityAttribute,
  updateResponseDeliveryOption,
  updateFormPurpose,
} from "@lib/templates";

import { serverTranslation } from "@i18n";
import { revalidatePath } from "next/cache";
import { checkOne } from "@lib/cache/flags";
import { isValidDateString } from "@lib/utils/date/isValidDateString";

export type CreateOrUpdateTemplateType = {
  id?: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: FormPurpose;
};

export const createOrUpdateTemplate = async ({
  id,
  formConfig,
  name,
  deliveryOption,
  securityAttribute,
  formPurpose,
}: CreateOrUpdateTemplateType): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    revalidatePath("/[locale]/forms", "page");

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
    return await createTemplate({
      formConfig,
      name,
      deliveryOption,
      securityAttribute,
      formPurpose,
    });
  } catch (e) {
    return { formRecord: null, error: (e as Error).message };
  }
};

export const createTemplate = async ({
  formConfig,
  name,
  deliveryOption,
  securityAttribute,
  formPurpose,
}: {
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: FormPurpose;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { session, ability } = await authCheckAndThrow();

    const response = await createDbTemplate({
      ability: ability,
      userID: session.user.id,
      formConfig: formConfig,
      name: name,
      deliveryOption: deliveryOption,
      securityAttribute: securityAttribute,
      formPurpose: formPurpose,
    });

    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { formConfig: ${formConfig}, name: ${name}, deliveryOption: ${deliveryOption}, securityAttribute: ${securityAttribute}`
      );
    }

    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
  }
};

export const updateTemplate = async ({
  id: formID,
  formConfig,
  name,
  deliveryOption,
  securityAttribute,
  formPurpose,
}: {
  id: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
  formPurpose?: FormPurpose;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheckAndThrow();

    const response = await updateDbTemplate({
      ability: ability,
      formID: formID,
      formConfig: formConfig,
      name: name,
      deliveryOption: deliveryOption,
      securityAttribute: securityAttribute,
      formPurpose: formPurpose,
    });
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { formConfig: ${formConfig}, name: ${name}, deliveryOption: ${deliveryOption}, securityAttribute: ${securityAttribute}`
      );
    }
    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
  }
};

export const updateTemplatePublishedStatus = async ({
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
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheckAndThrow();

    const response = await updateIsPublishedForTemplate(
      ability,
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
};

export const updateTemplateFormPurpose = async ({
  id: formID,
  formPurpose,
}: {
  id: string;
  formPurpose: string;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheckAndThrow();

    const response = await updateFormPurpose(ability, formID, formPurpose);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${formPurpose} }`
      );
    }

    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
  }
};

export const updateTemplateSecurityAttribute = async ({
  id: formID,
  securityAttribute,
}: {
  id: string;
  securityAttribute: SecurityAttribute;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheckAndThrow();

    const response = await updateSecurityAttribute(ability, formID, securityAttribute);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${securityAttribute} }`
      );
    }

    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
  }
};

export const closeForm = async ({
  id: formID,
  closingDate,
  closedDetails,
}: {
  id: string;
  closingDate: string | null;
  closedDetails?: ClosedDetails;
}): Promise<{
  formID: string;
  closingDate: string | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheckAndThrow();

    // closingDate: null means the form is open, or will be set to be open
    // closingDate: (now/past date) means the form is closed
    // closingDate: (future date) means the form is scheduled to close in the future

    if (closingDate && !isValidDateString(closingDate)) {
      throw new Error(`Invalid closing date. Request information: { ${formID}, ${closingDate} }`);
    }

    const response = await updateClosedData(ability, formID, closingDate, closedDetails);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${closingDate} }`
      );
    }

    return response;
  } catch (error) {
    return { formID: "", closingDate: null, error: (error as Error).message };
  }
};

export const updateTemplateUsers = async ({
  id: formID,
  users,
}: {
  id: string;
  users: { id: string }[];
}): Promise<{
  success: boolean;
  error?: string;
}> => {
  if (!users.length) {
    return { success: false, error: "mustHaveAtLeastOneUser" };
  }

  try {
    const { ability } = await authCheckAndThrow();

    const response = await updateAssignedUsersForTemplate(ability, formID, users);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${users} }`
      );
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
};

export const updateTemplateDeliveryOption = async ({
  id: formID,
  deliveryOption,
}: {
  id: string;
  deliveryOption: DeliveryOption | undefined;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    if (!deliveryOption) {
      throw new Error("Require Delivery Option Data");
    }

    const { ability } = await authCheckAndThrow();

    const response = await updateResponseDeliveryOption(ability, formID, deliveryOption);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${deliveryOption} }`
      );
    }

    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
  }
};

export const sendResponsesToVault = async ({
  id: formID,
}: {
  id: string;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheckAndThrow();

    const response = await removeDeliveryOption(ability, formID);
    if (!response) {
      throw new Error(`Template API response was null. Request information: { ${formID} }`);
    }

    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
  }
};

export const deleteTemplate = async ({
  id: formID,
}: {
  id: string;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheckAndThrow();

    const response = await deleteDbTemplate(ability, formID);

    if (!response) {
      throw new Error(`Template API response was null. Request information: { ${formID} }`);
    }

    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
  }
};

export const getTranslatedElementProperties = async (type: string) => {
  const { t: en } = await serverTranslation("form-builder", { lang: "en" });
  const { t: fr } = await serverTranslation("form-builder", { lang: "fr" });
  return {
    description: {
      en: en([`defaultElementDescription.${type}`, ""]),
      fr: fr([`defaultElementDescription.${type}`, ""]),
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

export async function checkFlag(id: string) {
  return checkOne(id);
}
