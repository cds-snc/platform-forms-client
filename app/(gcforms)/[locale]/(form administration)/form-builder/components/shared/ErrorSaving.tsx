import { LinkButton } from "@clientComponents/globals";
import { useTranslation } from "@i18n/client";
import { DownloadFileButton } from "./DownloadFileButton";

export const ErrorSaving = ({ errorCode }: { errorCode?: string }) => {
  const { t, i18n } = useTranslation("form-builder");
  const supportHref = `/${i18n.language}/support`;

  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("errorSavingForm.title")}</h3>
      <p className="mb-2 text-black">
        {t("errorSavingForm.description")}{" "}
        <LinkButton.Primary href={supportHref}>
          {t("errorSavingForm.supportLink")}
        </LinkButton.Primary>
      </p>
      <p className="mb-5 text-sm text-black">
        {errorCode && t("errorSavingForm.errorCode", { code: errorCode })}
      </p>
      <DownloadFileButton theme="primary" showInfo={false} autoShowDialog={false} />
    </div>
  );
};
