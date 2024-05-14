"use server";

import { auth } from "@lib/auth";
import { AccessControlError, createAbility } from "@lib/privileges";
import { DeliveryOption, FormProperties, FormRecord, SecurityAttribute } from "@lib/types";
import {
  TemplateAlreadyPublishedError,
  createTemplate as createDbTemplate,
  removeDeliveryOption,
  updateAssignedUsersForTemplate,
  updateClosingDateForTemplate,
  updateTemplate as updateDbTemplate,
  updateIsPublishedForTemplate,
  deleteTemplate as deleteDbTemplate,
  TemplateHasUnprocessedSubmissions,
  updateSecurityAttribute,
  updateResponseDeliveryOption,
} from "@lib/templates";
import { logMessage } from "@lib/logger";
import { serverTranslation } from "@i18n";
import { revalidatePath } from "next/cache";
import { checkOne } from "@lib/cache/flags";

const _getSessionAndAbility = async () => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const ability = createAbility(session);

  return { session, ability };
};

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
      return {
        formRecord: await updateTemplate({
          id,
          formConfig,
          name,
          deliveryOption,
          securityAttribute,
        }),
      };
    }
    return {
      formRecord: await createTemplate({ formConfig, name, deliveryOption, securityAttribute }),
    };
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
}) => {
  try {
    const { session, ability } = await _getSessionAndAbility();

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

    return response;
  } catch (error) {
    if (error instanceof AccessControlError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
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
}) => {
  try {
    const { ability } = await _getSessionAndAbility();

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
    return response;
  } catch (error) {
    if (error instanceof AccessControlError || error instanceof TemplateAlreadyPublishedError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
  }
};

export const updateTemplatePublishedStatus = async ({
  id: formID,
  isPublished,
}: {
  id: string;
  isPublished: boolean;
}) => {
  try {
    const { ability } = await _getSessionAndAbility();

    const response = await updateIsPublishedForTemplate(ability, formID, isPublished);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${isPublished} }`
      );
    }

    revalidatePath("/form-builder/[id]", "layout");

    return response;
  } catch (error) {
    if (error instanceof AccessControlError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
  }
};

export const updateTemplateSecurityAttribute = async ({
  id: formID,
  securityAttribute,
}: {
  id: string;
  securityAttribute: SecurityAttribute;
}) => {
  try {
    const { ability } = await _getSessionAndAbility();

    const response = await updateSecurityAttribute(ability, formID, securityAttribute);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${securityAttribute} }`
      );
    }

    return response;
  } catch (error) {
    if (error instanceof AccessControlError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
  }
};

export const updateTemplateClosingDate = async ({
  id: formID,
  closingDate,
}: {
  id: string;
  closingDate: string;
}) => {
  try {
    const { ability } = await _getSessionAndAbility();

    const response = await updateClosingDateForTemplate(ability, formID, closingDate);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${closingDate} }`
      );
    }

    return response;
  } catch (error) {
    if (error instanceof AccessControlError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
  }
};

export const updateTemplateUsers = async ({
  id: formID,
  users,
}: {
  id: string;
  users: { id: string; action: "add" | "remove" }[];
}) => {
  if (!users.length) {
    throw new Error("mustHaveAtLeastOneUser");
  }

  try {
    const { ability } = await _getSessionAndAbility();

    const response = await updateAssignedUsersForTemplate(ability, formID, users);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${users} }`
      );
    }

    return response;
  } catch (error) {
    if (error instanceof AccessControlError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
  }
};

export const updateTemplateDeliveryOption = async ({
  id: formID,
  deliveryOption,
}: {
  id: string;
  deliveryOption: DeliveryOption | undefined;
}) => {
  if (!deliveryOption) {
    return; // use sendResponsesToVault to remove delivery option should this be an exception?
  }

  try {
    const { ability } = await _getSessionAndAbility();

    const response = await updateResponseDeliveryOption(ability, formID, deliveryOption);
    if (!response) {
      throw new Error(
        `Template API response was null. Request information: { ${formID}, ${deliveryOption} }`
      );
    }

    return response;
  } catch (error) {
    if (error instanceof AccessControlError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
  }
};

export const sendResponsesToVault = async ({ id: formID }: { id: string }) => {
  try {
    const { ability } = await _getSessionAndAbility();

    const response = await removeDeliveryOption(ability, formID);
    if (!response) {
      throw new Error(`Template API response was null. Request information: { ${formID} }`);
    }

    return response;
  } catch (error) {
    if (error instanceof AccessControlError) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
  }
};

export const deleteTemplate = async ({ id: formID }: { id: string }) => {
  try {
    const { ability } = await _getSessionAndAbility();

    const response = await deleteDbTemplate(ability, formID);

    if (!response) {
      throw new Error(`Template API response was null. Request information: { ${formID} }`);
    }

    return response;
  } catch (error) {
    if (error instanceof AccessControlError || error instanceof TemplateHasUnprocessedSubmissions) {
      throw error;
    } else {
      logMessage.error(error);
      throw error;
    }
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
