"use client";

import * as Alert from "@clientComponents/globals/Alert/Alert";
import { Button } from "@clientComponents/globals/Buttons/Button";
import { useTranslation } from "@i18n/client";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";

export default function Error({ reset }: { reset: () => void }) {
  const { t } = useTranslation("form-builder-responses");

  return (
    <div>
      <Alert.Danger>
        <Alert.Title>{t("errors.generic.title")}</Alert.Title>
        <Alert.Body>
          <>
            <p>{t("errors.generic.message")}</p>
            <p>
              {t("errors.errorCode")} {FormServerErrorCodes.RESPONSES}
            </p>
            <Button className="mt-4" theme="secondary" onClick={() => reset()}>
              {t("errors.retrieval.tryAgain")}
            </Button>
          </>
        </Alert.Body>
      </Alert.Danger>
    </div>
  );
}
