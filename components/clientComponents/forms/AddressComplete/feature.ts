import { checkFlag } from "@formBuilder/actions";

//Seperated from utils to avoid unavailable dependencies in testing and response downloads.
export const allowAddressComplete = async () => {
  return checkFlag("addressComplete");
};
