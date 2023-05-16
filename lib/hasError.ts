export const hasError = (errorNames: string | string[], message: string) => {
  if (typeof errorNames === "string") {
    errorNames = [errorNames];
  }
  return errorNames.some((errorName) => message.includes(errorName));
};
