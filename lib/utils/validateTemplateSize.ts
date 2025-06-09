import { BODY_SIZE_LIMIT } from "@root/constants";

export const validateTemplateSize = (
  formConfig: string,
  bodySizeLimit: number = BODY_SIZE_LIMIT
) => {
  try {
    const formConfigSize = formConfig.length;

    if (formConfigSize > bodySizeLimit) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
