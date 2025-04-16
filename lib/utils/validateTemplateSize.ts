import { maxPayloadSize as maxSize } from "./maxPayload";

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
