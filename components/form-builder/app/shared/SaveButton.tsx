import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useSession } from "next-auth/react";

import { useTemplateStore } from "../../store";
import { usePublish, useAllowPublish } from "../../hooks";
import { Button, withMessage } from "../shared/Button";

export const SaveButton = () => {
  const { getSchema, id, setId } = useTemplateStore((s) => ({
    localizeField: s.localizeField,
    getSchema: s.getSchema,
    id: s.id,
    setId: s.setId,
    email: s.submission?.email,
  }));

  const { status } = useSession();
  const { t } = useTranslation(["common", "form-builder"]);
  const { isReady, asPath } = useRouter();
  const [isStartPage, setIsStartPage] = useState(false);
  const { uploadJson } = usePublish();
  const { isSaveable } = useAllowPublish();

  const handlePublish = async () => {
    const schema = JSON.parse(getSchema());
    delete schema.id;
    delete schema.isPublished;

    const result = await uploadJson(JSON.stringify(schema), id);

    if (result?.id) {
      setId(result?.id);
    }
  };

  useEffect(() => {
    if (isReady) {
      const activePathname = new URL(asPath, location.href).pathname;
      if (activePathname === "/form-builder") {
        setIsStartPage(true);
      } else {
        setIsStartPage(false);
      }
    }
  }, [asPath, isReady]);

  const ButtonWithMessage = withMessage(Button, t("saveDraftMessage", { ns: "form-builder" }));

  return !isStartPage && isSaveable() && status === "authenticated" ? (
    <ButtonWithMessage className="ml-4" onClick={handlePublish}>
      {t("saveDraft", { ns: "form-builder" })}
    </ButtonWithMessage>
  ) : null;
};
