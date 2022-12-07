import React, { ReactElement, useEffect } from "react";
export const ResumeEditingForm = ({ children }: { children: ReactElement }) => {
  const [isReady, setReady] = React.useState(false);

  useEffect(() => {
    if (typeof sessionStorage !== "undefined" && sessionStorage.getItem("form-storage")) {
      setReady(true);
    }
  }, []);

  return isReady ? <div className="inline">{children}</div> : null;
};
