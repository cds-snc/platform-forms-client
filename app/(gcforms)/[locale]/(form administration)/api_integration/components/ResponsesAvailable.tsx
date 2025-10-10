import { Success } from "@clientComponents/globals/Alert/Alert";

export const ResponsesAvailable = ({ message }: { message: string | null }) => {
  if (message) {
    return <Success className="mb-4" title="New Responses Available" body={message} />;
  }
  return null;
};
