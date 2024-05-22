"use client";

import * as Alert from "@clientComponents/globals/Alert/Alert";
import { useTranslation } from "@i18n/client";

export default function Error({ reset }: { reset: () => void }) {
  const { t } = useTranslation("form-builder-responses");

  return (
    <div>
      <Alert.Danger>
        <Alert.Title>{t("errors.generic.title")}</Alert.Title>
        <Alert.Body>
          <>
            {t("errors.generic.message")}{" "}
            <button onClick={() => reset()}>{t("errors.generic.tryAgain")}</button>
          </>
        </Alert.Body>
      </Alert.Danger>
    </div>
  );
}
