import { ReactElement } from "react";

export const Field = ({ children }: { children: ReactElement | string }) => {
  return <div className="flex flex-col mb-10">{children}</div>;
};
