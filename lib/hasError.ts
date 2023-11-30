import axios, { AxiosError } from "axios";

export const hasError = (
  errorNames: string | string[],
  error: string | Error | AxiosError | unknown | undefined = ""
) => {
  if (!error) {
    return false;
  }

  try {
    let message = "";

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message as string;
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = error.toString();
    }

    if (typeof errorNames === "string") {
      errorNames = [errorNames];
    }
    return errorNames.some((errorName) => message.includes(errorName));
  } catch (e) {
    return false;
  }
};
