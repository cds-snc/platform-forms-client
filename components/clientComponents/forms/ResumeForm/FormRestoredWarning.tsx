import { useTranslation } from "@i18n/client";

export const FormRestoredWarning = () => {
  const { t } = useTranslation("common");

  return (
    <div className="w-full text-black">
      <h3 className="mt-0! mb-2! pb-0 text-xl font-semibold text-black">
        {t("saveAndResume.formRestoredWarning.title")}
      </h3>
      <p className="mb-2 text-black">{t("saveAndResume.formRestoredWarning.message")}</p>
    </div>
  );
};
