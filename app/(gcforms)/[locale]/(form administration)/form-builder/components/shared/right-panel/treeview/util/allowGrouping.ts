import { checkFlag } from "@formBuilder/actions";

export const allowGrouping = async () => {
  return checkFlag("conditionalLogic");
};
