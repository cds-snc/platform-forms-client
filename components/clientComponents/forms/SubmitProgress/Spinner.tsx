import { SpinnerIcon } from "@serverComponents/icons/SpinnerIcon";

export const Spinner = () => {
  return (
    <div className="flex items-center justify-center">
      <SpinnerIcon className="size-8 animate-spin fill-indigo-500 text-white dark:text-white" />
    </div>
  );
};
