import { ReactElement } from "react";

export const Error = ({
  children,
  fieldName,
}: {
  children: ReactElement | string;
  fieldName: string;
}) => {
  return (
    <p id={`error-${fieldName}`} aria-live="polite" className="text-red-500">
      {children}
    </p>
  );
};
