"use server";

import { authCheck } from "@lib/actions";
import { DeliveryOption, FormProperties, FormRecord, SecurityAttribute } from "@lib/types";
import {
  createTemplate as createDbTemplate,
  removeDeliveryOption,
  updateAssignedUsersForTemplate,
  updateClosingDateForTemplate,
  updateTemplate as updateDbTemplate,
  updateIsPublishedForTemplate,
  deleteTemplate as deleteDbTemplate,
  updateSecurityAttribute,
  updateResponseDeliveryOption,
} from "@lib/templates";

import { serverTranslation } from "@i18n";
import { revalidatePath } from "next/cache";
import { checkOne } from "@lib/cache/flags";

export type CreateOrUpdateTemplateType = {
  id?: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
};

export const createOrUpdateTemplate = async ({
  id,
  formConfig,
  name,
  deliveryOption,
  securityAttribute,
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
      });
    }
    return await createTemplate({ formConfig, name, deliveryOption, securityAttribute });
  } catch (e) {
    return { formRecord: null, error: (e as Error).message };
  }
};

export const createTemplate = async ({
  formConfig,
  name,
  deliveryOption,
  securityAttribute,
}: {
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { session, ability } = await authCheck();

    const response = await createDbTemplate({
      ability: ability,
      userID: session.user.id,
      formConfig: formConfig,
      name: name,
      deliveryOption: deliveryOption,
      securityAttribute: securityAttribute,
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
}: {
  id: string;
  formConfig: FormProperties;
  name?: string;
  deliveryOption?: DeliveryOption;
  securityAttribute?: SecurityAttribute;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheck();

    const response = await updateDbTemplate({
      ability: ability,
      formID: formID,
      formConfig: formConfig,
      name: name,
      deliveryOption: deliveryOption,
      securityAttribute: securityAttribute,
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
}: {
  id: string;
  isPublished: boolean;
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheck();

    const response = await updateIsPublishedForTemplate(ability, formID, isPublished);
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
    const { ability } = await authCheck();

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

export const updateTemplateClosingDate = async ({
  id: formID,
  closingDate,
}: {
  id: string;
  closingDate: string;
}): Promise<{
  formID: string;
  closingDate: string | null;
  error?: string;
}> => {
  try {
    const { ability } = await authCheck();

    const response = await updateClosingDateForTemplate(ability, formID, closingDate);
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
  users: { id: string; action: "add" | "remove" }[];
}): Promise<{
  formRecord: FormRecord | null;
  error?: string;
}> => {
  if (!users.length) {
    throw new Error("mustHaveAtLeastOneUser");
  }

  try {
    const { ability } = await authCheck();

    const response = await updateAssignedUsersForTemplate(ability, formID, users);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${users} }`
      );
    }

    return { formRecord: response };
  } catch (error) {
    return { formRecord: null, error: (error as Error).message };
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
  if (!deliveryOption) {
    throw new Error("Require Delivery Option Data");
  }

  try {
    const { ability } = await authCheck();

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
    const { ability } = await authCheck();

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
    const { ability } = await authCheck();

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

export async function checkFlag(id: string) {
  return checkOne(id);
}
