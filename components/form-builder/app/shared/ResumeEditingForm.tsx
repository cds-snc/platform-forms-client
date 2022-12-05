import React, { ReactElement } from "react";
export const ResumeEditingForm = ({ children }: { children: ReactElement }) => {
  return sessionStorage.getItem("form-storage") ? <div>{children}</div> : null;
};
