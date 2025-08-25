import { FormElement, BetaFormElementTypes } from "@gcforms/types";
import { Flags } from "@lib/cache/types";

export class BetaComponentsError extends Error {
  constructor() {
    super("User can not use Beta Components");
    this.name = "BetaComponentsError";
    Object.setPrototypeOf(this, BetaComponentsError.prototype);
  }
}

export const checkForBetaComponents = (
  elements: FormElement[],
  checkFeatureFlag: (flag: string) => boolean
) => {
  //  Filter out beta components
  const foundBetaComponents = elements.filter((element) =>
    Object.keys(BetaFormElementTypes).includes(element.type)
  );

  // Short circuit if no betaComponents are being used
  if (foundBetaComponents.length === 0) return;

  const uniqueComponentFlagsToCheck = [
    ...new Set(foundBetaComponents.map((component) => component.type)),
  ].map(
    (type) => BetaFormElementTypes[type as keyof typeof BetaFormElementTypes]?.flag as keyof Flags
  );

  // check global and user flags using react hook
  const allowedBetaComponents = uniqueComponentFlagsToCheck
    .map((flag) => checkFeatureFlag(flag))
    .reduce((prev, curr) => prev && curr, true);

  // Short Circuit if component is allowed globally
  if (!allowedBetaComponents) {
    throw new BetaComponentsError();
  }
};
