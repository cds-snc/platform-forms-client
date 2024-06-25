// import { checkFlag } from "@formBuilder/actions";

export const allowGrouping = async () => {
  if (process.env.APP_ENV === "test") {
    return false;
  }

  return true;
};
