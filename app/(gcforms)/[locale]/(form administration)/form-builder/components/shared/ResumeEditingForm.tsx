"use client";
import React, { ReactElement, useEffect } from "react";

import { clearTemplateStore } from "../../../../../../../components/clientComponents/form-builder/store";

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
      clearTemplateStore();
    }
  }, []);

  return hasSession ? <div>{children}</div> : null;
};
