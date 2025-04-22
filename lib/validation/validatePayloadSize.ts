import { maxResponsesSize as maxSize } from "../../constants";
import { TransformedResponse } from "app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/transformFormResponses";

export const validatePayloadSize = (
  responses: TransformedResponse,
  maxPayloadSize: number = maxSize
) => {
  try {
    const jsonString = JSON.stringify(responses);
    return new Blob([jsonString]).size <= maxPayloadSize;
  } catch (e) {
    return false;
  }
};
