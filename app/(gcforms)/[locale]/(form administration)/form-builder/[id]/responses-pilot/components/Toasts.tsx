import { useTranslation } from "@root/i18n/client";

export const LocationSelected = ({ directoryName }: { directoryName: string }) => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("locationPage.locationSelected.title")}
      </h3>
      <p className="mb-0 text-black">{t("locationPage.locationSelected.text1")}</p>
      <p className="mb-2 font-bold text-black">/{directoryName}</p>
    </div>
  );
};

export const CsvDetected = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("locationPage.csvDetected.title")}</h3>
      <p className="mb-2 text-black">{t("locationPage.csvDetected.message")}</p>
    </div>
  );
};

export const TemplateFailed = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("locationPage.getTemplateFailed.title")}
      </h3>
      <p className="mb-2 text-black">{t("locationPage.getTemplateFailed.message")}</p>
    </div>
  );
};

export const RateLimitExceeded = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("toastMessages.rateLimitExceeded.title")}
      </h3>
      <p className="mb-2 text-black">{t("toasts.rateLimitExceeded.message")}</p>
    </div>
  );
};

export const UnknownError = ({ code }: { code?: string }) => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("toasts.unknownError.title")}</h3>
      <p className="mb-2 text-black">{t("toasts.unknownError.message")}</p>
      {code && (
        <p className="mb-2 text-black">
          {t("toasts.unknownError.code")}: {code}
        </p>
      )}
    </div>
  );
};

export const ErrorRetreivingSubmissions = ({ code }: { code?: string }) => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">
        {t("toasts.errorRetreivingSubmissions.title")}
      </h3>
      <p className="mb-2 text-black">{t("toasts.errorRetreivingSubmissions.message")}</p>
      {code && (
        <p className="mb-2 text-black">
          {t("toasts.unknownError.code")}: {code}
        </p>
      )}
    </div>
  );
};

export const FileLockedError = () => {
  const { t } = useTranslation("response-api");
  return (
    <div className="w-full">
      <h3 className="!mb-0 pb-0 text-xl font-semibold">{t("toasts.fileLockedError.title")}</h3>
      <p className="mb-2 text-black">{t("toasts.fileLockedError.message")}</p>
    </div>
  );
};
