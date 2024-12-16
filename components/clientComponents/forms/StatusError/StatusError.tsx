import { Alert } from "@clientComponents/forms";
import { ErrorStatus } from "../Alert/Alert";
import { useTranslation } from "@i18n/client";
import { Language } from "@lib/types/form-builder-types";
import { Trans } from "react-i18next";

const Text = ({
  ns = "error",
  i18nKey,
  values,
}: {
  ns?: string;
  i18nKey: string;
  values?: Record<string, string>;
}) => {
  return (
    <Trans
      ns={ns}
      i18nKey={i18nKey}
      defaults="<strong></strong> <a></a>"
      components={{ strong: <strong />, a: <a /> }}
      values={values}
      tOptions={{ interpolation: { escapeValue: false } }}
    />
  );
};

export const StatusError = ({ formId, language }: { formId: string; language: Language }) => {
  const { t } = useTranslation("error");
  const link = `/${language}/id/${formId}`;
  return (
    <Alert type={ErrorStatus.ERROR} tabIndex={0} id="gc-form-errors-server">
      <h2>{t("sever-error.title")}</h2>
      <div className="mt-4">
        <Text i18nKey="sever-error.body" values={{ formLink: link }} />
      </div>
    </Alert>
  );
};
