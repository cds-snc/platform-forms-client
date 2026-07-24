import { serverTranslation } from "@root/i18n";

export const UpdatePublishedHelp = async () => {
  const { t } = await serverTranslation("my-forms");

  return (
    <div className="mt-4 rounded border border-violet-700 bg-violet-50 p-4 text-sm">
      <h2 className="mb-0 p-0 text-base font-bold">{t("updatePublishedHelp.title")}</h2>
      <ol className="mt-3 pl-4">
        <li>{t("updatePublishedHelp.step1")}</li>
        <li>{t("updatePublishedHelp.step2")}</li>
        <li>{t("updatePublishedHelp.step3")}</li>
      </ol>
      <p className="mt-3">{t("updatePublishedHelp.description")}</p>
    </div>
  );
};
