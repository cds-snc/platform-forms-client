import { BODY_SIZE_LIMIT as maxSize } from "../../constants";

export const validateTemplateSize = (formConfig: string, bodySizeLimit: number = maxSize) => {
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
