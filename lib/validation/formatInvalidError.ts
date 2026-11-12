import { truncateString } from "@lib/client/clientHelpers";

export const formatInvalidError = (message: string, question?: string): string => {
  const label = truncateString(question ?? "");
  return label ? `${message.replace(/\.$/, "")}: ${label}` : message;
};
