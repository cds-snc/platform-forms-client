"use server";

import { auth } from "@lib/auth";
import { AccessControlError, createAbility } from "@lib/privileges";
import { DeliveryOption, FormProperties, SecurityAttribute } from "@lib/types";
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
} from "@lib/templates";
import { logMessage } from "@lib/logger";

const _getSessionAndAbility = async () => {
  const session = await auth();

  if (!session) {
    throw new Error("User is not authenticated");
  }

  const ability = createAbility(session);

  return { session, ability };
};

// @TODO: review error messages + exception throwing/handling
//        for example, should we just re-throw the same error
//        instead of a generic?

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
