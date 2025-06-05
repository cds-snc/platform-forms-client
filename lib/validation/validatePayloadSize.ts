import { MAX_RESPONSE_SIZE } from "../../constants";
import { TransformedResponse } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/transformFormResponses";

export const validatePayloadSize = (
  responses: TransformedResponse,
  maxPayloadSize: number = MAX_RESPONSE_SIZE
) => {
  try {
    const jsonString = JSON.stringify(responses);
    return new Blob([jsonString]).size <= maxPayloadSize;
  } catch (e) {
    return false;
  }
};
