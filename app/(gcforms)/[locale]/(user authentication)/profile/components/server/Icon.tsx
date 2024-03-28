import { CancelIcon, CircleCheckIcon } from "@serverComponents/icons";

export const Icon = ({ checked }: { checked: boolean }) => {
  return checked ? (
    <CircleCheckIcon className="mr-2 inline-block w-9 fill-green-700" />
  ) : (
    <CancelIcon className="mr-2 inline-block h-9 w-9 fill-red-700" />
  );
};
