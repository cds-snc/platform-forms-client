import { maxPayloadSize as maxSize } from "../../config/constants";

export const validateTemplateSize = (formConfig: string, maxPayloadSize: number = maxSize) => {
  try {
    const formConfigSize = formConfig.length;

    if (formConfigSize > maxPayloadSize) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
};
