import LinkButton from "@serverComponents/globals/Buttons/LinkButton";
import { useTranslation } from "@i18n/client";
import { DownloadFileButton } from "./DownloadFileButton";

export const ErrorSaving = ({ errorCode, message }: { errorCode?: string; message?: string }) => {
  const { t, i18n } = useTranslation("form-builder");
  const supportHref = `/${i18n.language}/support`;

  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("errorSavingForm.title")}</h3>
      <p className="mb-2 text-black">
        {message || t("errorSavingForm.description")}{" "}
        <LinkButton href={supportHref}>{t("errorSavingForm.supportLink")}</LinkButton>.
      </p>
      <p className="mb-5 text-sm text-black">
        {errorCode && t("errorSavingForm.errorCode", { code: errorCode })}
      </p>
      <DownloadFileButton theme="primary" showInfo={false} autoShowDialog={false} />
    </div>
  );
};
