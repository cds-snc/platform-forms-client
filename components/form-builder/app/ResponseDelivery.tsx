import React, { useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";

import { SetResponseDelivery } from "./SetResponseDelivery";
import { SettingsLoggedOut } from "./SettingsLoggedOut";
import { useTemplateApi } from "../hooks";
import { useTemplateStore } from "../store/useTemplateStore";

export const ResponseDelivery = () => {
  const { t } = useTranslation("form-builder");
  const { status } = useSession();
  const { saveForm } = useTemplateApi();
  const saved = useRef(false);

  const { id, setId } = useTemplateStore((s) => ({
    id: s.id,
    setId: s.setId,
  }));

  // auto save form if authenticated and not saved
  useEffect(() => {
    if (status === "authenticated" && !saved.current && !id) {
      const save = async () => {
        const result = await saveForm();
        if (result) {
          setId(result);
        }
      };

      save();

      return () => {
        saved.current = true;
      };
    }
  }, [status, id, saveForm, setId]);

  return (
    <>
      <h1 className="visually-hidden">{t("formSettings")}</h1>
      <SettingsLoggedOut />
      <SetResponseDelivery />
    </>
  );
};
