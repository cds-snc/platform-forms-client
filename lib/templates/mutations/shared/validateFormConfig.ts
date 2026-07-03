import { FormProperties } from "@lib/types";
import { checkForBetaComponentsAsync } from "@lib/validation/betaCheck";
import { logMessage } from "@lib/logger";
import { checkFlag } from "../../internal";
import { validateTemplate } from "@lib/utils/form-builder/validate";
import { InvalidFormConfigError } from "../../internal/errors";
import { validateTemplateSize } from "@lib/utils/validateTemplateSize";

/**
 * Validate the form config for a template update command
 * @param formConfig
 * @param user
 */
export const validateFormConfig = async (formConfig: FormProperties, user: { email: string }) => {
  await checkForBetaComponentsAsync(formConfig.elements, checkFlag).catch((e) => {
    logMessage.warn(`User ${user.email} tried to use beta form components without flags being set`);
    throw e;
  });

  const validationResult = validateTemplate(formConfig);

  if (!validationResult.valid) {
    logMessage.warn(
      `[templates][updateTemplate] Form config is invalid.\nReasons: ${JSON.stringify(
        validationResult.errors
      )}.\nConfig: ${JSON.stringify(formConfig)}`
    );
    throw new InvalidFormConfigError();
  }

  const isValid = validateTemplateSize(JSON.stringify(formConfig));

  if (!isValid) {
    logMessage.warn(
      `[templates][updateTemplate] Template size exceeds the limit.\nConfig: ${JSON.stringify(
        formConfig
      )}`
    );
    throw new InvalidFormConfigError();
  }
};
