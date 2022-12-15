import React, { ReactElement, useEffect } from "react";
export const ResumeEditingForm = ({ children }: { children: ReactElement }) => {
  const [hasSession, setHasSession] = React.useState(false);

  useEffect(() => {
    if (typeof sessionStorage === "undefined") {
      return;
    }

    try {
      // check if there is a valid form session
      const data = sessionStorage.getItem("form-storage");
      const parsedData = data && JSON.parse(data);
      const {
        state: {
          form: { titleEn, titleFr },
        },
      } = parsedData;

      if (titleEn !== "" || titleFr !== "") {
        setHasSession(true);
        return;
      }

      // clean up empty sessions
      throw new Error("Invalid form session");
    } catch (e) {
      // noop
      sessionStorage.removeItem("form-storage");
    }
  }, []);

  return hasSession ? <div className="inline">{children}</div> : null;
};
