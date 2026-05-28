import type { SharedElementDefinition } from "@lib/form-elements/sharedHooks";

export const sharedDefinition: SharedElementDefinition = {
  normalizeResponse: (value) => value,
  answerToString: (_question, answer) => (answer ?? "") as string,
};

export default sharedDefinition;
