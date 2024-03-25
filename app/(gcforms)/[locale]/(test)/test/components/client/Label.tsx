import { ReactElement } from "react";

export const Label = ({
  children,
  fieldName,
  hasError,
}: {
  children: ReactElement | string;
  fieldName: string;
  hasError: boolean;
}) => {
  return (
    <label
      id={`label-${fieldName}`}
      htmlFor={`${fieldName}`}
      className={`${hasError && "text-red-500"}`}
    >
      {children}
    </label>
  );
};
